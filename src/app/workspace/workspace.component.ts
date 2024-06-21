import { Component, inject, Output, EventEmitter } from '@angular/core';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { CommonModule } from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { UserService } from '../user.service';
import { ChannelComponent } from '../channel/channel.component';



@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, ChannelComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  database = inject(DatabaseService);
  userService = inject(UserService);
  


  activeUser = new User()
  
  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];

  hideConversationBody: boolean = false;
  hideChannelBody: boolean = false;


  userSimon: string = 'simon@dummy.de';

  @Output() changeChannel = new EventEmitter<Channel>();
  


  constructor(public dialog: MatDialog, public us: UserService){  
    this.loadActiveUserChannels();
    this.loadActiveUserConversations();
  }


  loadActiveUserChannels(){
    this.database.getUser(this.userSimon).then(user =>{
      this.activeUser = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        this.activeUserChannels = userChannels
      });
    })
  }


  loadActiveUserConversations(){
    this.database.getUser(this.userSimon).then(user =>{
      this.database.loadAllUserConversations(user.userId)
      .then(userConversations => {
        this.activeUserConversationList = userConversations;
        userConversations.forEach(conversation =>{
          if(conversation.createdBy == user.userId){
            this.getRecievedConversation(conversation);
          }else{
            this.getCreatedConversation(conversation);
          }
        })
      });
    })
  }


  getCreatedConversation(conversation: Conversation){
    this.database.loadUser(conversation.createdBy)
    .then(loadedUser => {
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }


  getRecievedConversation(conversation: Conversation){
    this.database.loadUser(conversation.recipientId)
    .then(loadedUser => {
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }


  openConversation(conversationId: string){
    console.log('opened conversation with conversationId: ' + conversationId);
  }


  openChannel(channel: Channel){
    this.changeChannel.emit(channel);
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

  
  openCreateChannelDialog(){
    this.dialog.open(DialogCreateChannelComponent)
  }
}