import { Injectable, inject, OnInit, Component } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { getDocs, query, where } from "firebase/firestore";
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.class';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';
import { Conversation } from '../models/conversation.class';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './shared-services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  loggedUser: User;
  firestore: Firestore = inject(Firestore)
  dataBase = inject(DatabaseService);
  userCache: User;
  wrongLogin: boolean = false;
  resetUserPw: any;
  guest: boolean = false;
  guestData: any;
  userToken: string;
  pwCache: string = '';
  private baseUrl = 'http://localhost:4200';

  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];
  activeUserOwnConversation: Conversation;
 
  
  activeUserObject: User;
  isWorkspaceDataLoaded: boolean = true;
  deviceWidth: number



  //TODO - hiernach suchen wenns live geht und umgestellt werden soll
  activeUserMail: string = 'simon@dummy.de' //'ishakfeuer@gmail.com'  //'simon.w@gmx.net' //'simon@dummy.de' 




  constructor(private http: HttpClient, private router: Router, public database: DatabaseService) { 
    this.loadActiveUserChannels();    //muss nach dem login aufgerufen werden
    this.loadActiveUserConversations(); //muss nach dem login aufgerufen werden
    setTimeout(() => {
      console.log('active user channels', this.activeUserChannels)
      console.log('active user Conversations', this.activeUserConversationList)
      console.log('users from active ConversationList', this.usersFromActiveUserConversationList)
      console.log('activeUserOwnConversation', this.activeUserOwnConversation)
      console.log('activeuserobject', this.activeUserObject)
      
    }, 5000);
    
  }



  createAndSaveUser() {
    this.userCache['uid'] = this.userToken;
    this.addUser(this.userCache);
    setTimeout(() => {
      this.database.getUser(this.userCache.email)
        .then(user =>{
          this.database.addConversation(this.database.createConversation(user.userId, user.userId))
        })
    }, 1000);
  }


  
  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      responseType: 'json'
    });
    return this.http.request(req);
  }

  
  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }


  
  async checkEmail(email: string, myForm: FormGroup): Promise<void> {
    try {
      const q = query(collection(this.firestore, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty && myForm.valid) {
          const formValues = myForm.value;
          const newUser = new User({
            email: formValues.mail,
            name: formValues.name,
            status: 'offline',
            avatarUrl: '',
            userId: '',
            uid: null,
          });
          this.userCache = newUser;
          this.pwCache = formValues.pw;
          this.router.navigate(['/choosingAvatar']);
      } else {
        querySnapshot.forEach((doc) => {
          alert('Die angegebene email adresse, existiert bereits')
        });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Dokumente:', error);
    }
  }


  changePassword(id: string, pw: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      password: pw
    });
  }


  userOnline(id: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      status: "online"
    });
  }


  addUser(user: User) {
    addDoc(collection(this.firestore, 'users'), user.toJSON())
    .then(() => console.log('User erfolgreich hinzugefügt', user))
    .catch((error) => console.error('Fehler beim Hinzufügen des Benutzers:', error));
  }


  getUser(email: string, token: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');
      this.wrongLogin = true; // Setze standardmäßig auf true, bis ein gültiger Benutzer gefunden wird
  
      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['email'] === email && userData['uid'] === token) {
            const activeUser = new User({
              email: userData['email'],
              name: userData['name'],
              status: userData['status'],
              avatarUrl: userData['avatarUrl'],
              userId: user.id,
              logIn: userData['logIn'],
              usedLastTwoEmojis: userData['usedLastTwoEmojis'],
              uid: userData['uid']
            });
            this.wrongLogin = false; // Setze auf false, da gültiger Benutzer gefunden wurde
            resolve(activeUser);
          }
        });
        // Wenn nach Durchlauf der Benutzer keine Übereinstimmung gefunden wurde
        if (this.wrongLogin) {
          reject('User not found or wrong credentials');
        }
      }, (error) => {
        reject(error);
      });
    });
  }
  


  loadAllUsers(): Promise<Array<any>>{
    return new Promise<Array<any>>((resolve, reject) =>{
      const userList = [] as Array<any>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          userData['id'] = user.id; 
          userList.push(userData);
          resolve(userList);
        })
        }, (error) => {
          reject(error)
        })
    })
  }


  loadActiveUserChannels(){
    this.activeUserChannels = [];
    this.isWorkspaceDataLoaded = false;
    this.database.getUser(this.activeUserMail).then(user =>{
      this.activeUserObject = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        this.activeUserChannels = userChannels
        //this.isWorkspaceDataLoaded = true;

      });
    })
  }


  loadActiveUserConversations() {
    this.isWorkspaceDataLoaded = false;
    this.activeUserConversationList = [];
    this.usersFromActiveUserConversationList = [];
    this.database.getUser(this.activeUserMail).then(user => {
      this.database.loadAllUserConversations(user.userId)
        .then(userConversations => {
          const promises = userConversations.map(conversation => {
            this.activeUserConversationList.push(conversation);
  
            const userPromise = conversation.createdBy === user.userId
              ? this.getUserRecievedBy(conversation)
              : this.getUserCreatedBy(conversation);
  
            return userPromise.then(() => {
              this.checkOwnConversation(this.activeUserConversationList);
            }).then(() => {
              if (conversation.createdBy === this.activeUserObject.userId &&
                  conversation.recipientId === this.activeUserObject.userId) {
                  this.activeUserOwnConversation = conversation;
                  console.log('activeUserOwn First', this.activeUserOwnConversation);
              }
            });
          });
  
          // Wait for all promises to complete
          return Promise.all(promises);
        })
        .then(() => {
          
          this.database.loadSpecificUserConversation(this.activeUserObject.userId, this.activeUserOwnConversation.conversationId)
            .then((conversation => {
              this.activeUserOwnConversation = conversation
              console.log('activeUserOwn Second', this.activeUserOwnConversation);
              this.isWorkspaceDataLoaded = true;

            }))
        });
    });
  }


  checkOwnConversation(conversationList: Conversation[]){
    //debugger

    conversationList.forEach(conversation => {
      if(conversation.createdBy == this.activeUserObject.userId && conversation.recipientId == this.activeUserObject.userId){

        //this.activeUserOwnConversation = conversation;
        this.activeUserConversationList.splice(this.activeUserConversationList.indexOf(conversation), 1);
      }
    });


    
    //debugger;
    this.usersFromActiveUserConversationList.forEach(user => {
      if(user.userId == this.activeUserObject.userId){
        this.usersFromActiveUserConversationList.splice(this.usersFromActiveUserConversationList.indexOf(user), 1);
      }
    })

    

  }
 

  getUserCreatedBy(conversation: Conversation): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      this.database.loadUser(conversation.createdBy)
      .then(loadedUser => {
        this.usersFromActiveUserConversationList.push(loadedUser);
        resolve(loadedUser)
      },
      (error) =>{
        reject(error)
      }
    )
    })

  }


  getUserRecievedBy(conversation: Conversation): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      this.database.loadUser(conversation.recipientId)
      .then(loadedUser => {
        this.usersFromActiveUserConversationList.push(loadedUser);
        resolve(loadedUser)
      },
      (error) =>{
        reject(error)
      }
    )
    })
  }


  getDeviceWidth(){
    this.deviceWidth = window.innerWidth;
  }


}