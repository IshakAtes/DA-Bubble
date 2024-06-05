import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { ChannelMessage } from '../../models/channelMessage.class';
import { Reaction } from '../../models/reactions.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  firestore: Firestore = inject(Firestore);
  database = inject(DatabaseService);
  
  //test variables
  userId1: string = 'p1oEblSsradmfVeyvTu3';
  userId2: string = 'BSHDDuLBHC0o8RKcrcr6';
  userId3: string = 'zd1XsuBu16TsbC3OVe1o';
  channelId: string = 'CHA-p1oEblSsradmfVeyvTu3'
  userList: Array<any> = [];
  messageList: Array<ChannelMessage> = [];


  /*real variables */
  activeUser = new User()
  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];

  hideConversationBody: boolean = false;
  hideChannelBody: boolean = false;


  constructor(){  
    this.database.getUser('simon@dummy.de').then(user =>{
      this.activeUser = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        this.activeUserChannels = userChannels
      });
    })


    this.database.getUser('simon@dummy.de').then(user =>{
      this.database.loadAllUserConversations(user.userId)
      .then(userConversations => {
        this.activeUserConversationList = userConversations;
        userConversations.forEach(conversation =>{
          console.log('createdBy: ' + conversation.createdBy + ' recipientId ' + conversation.recipientId + ' userId: ' + user.userId)
          if(conversation.createdBy == user.userId){
            this.database.loadUser(conversation.recipientId)
            .then(loadedUser => {
              this.usersFromActiveUserConversationList.push(loadedUser);
              console.log('loadedUser from If-part: ' + loadedUser)
            })
          }else{
            this.database.loadUser(conversation.createdBy)
            .then(loadedUser => {
              this.usersFromActiveUserConversationList.push(loadedUser);
              console.log('loadedUser from else-part: ' + loadedUser)
            })
          }
        })
      });
    })


    
  }


  openConversation(conversationId: string){
    console.log('opened conversation with conversationId: ' + conversationId);
  }


  openChannel(channelId: string){
    console.log('opened channel with channelId: ' + channelId);
  }


  switchVisibilityChannelbody(){
    if(this.hideChannelBody){
      this.hideChannelBody = false;
    }
    else{
      this.hideChannelBody = true;
    }
  }


  switchVisibilityConversationbody(){
    if(this.hideConversationBody){
      this.hideConversationBody = false;
    }
    else{
      this.hideConversationBody = true;
    }
  }
}
