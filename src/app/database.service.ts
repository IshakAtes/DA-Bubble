import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Conversation } from '../models/conversation.class';
import { ChannelMessage } from '../models/channelMessage.class';
import { Reaction } from '../models/reactions.class';
import { ConversationMessage } from '../models/conversationMessage.class';
import { Timestamp, deleteDoc, setDoc } from 'firebase/firestore';
import { updateDoc, doc } from 'firebase/firestore'; // Korrigiert den Importpfad
import { WorkspaceComponent } from './workspace/workspace.component';
import { timestamp } from 'rxjs';
import { Thread } from '../models/thread.class';
import { ThreadMessage } from '../models/threadMessage';
import { ChannelThread } from '../models/channelThread.class';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore)
  workspace: WorkspaceComponent;

  constructor() {

  }

  /*create object Functions */


  /**
   * creates a user object
   * @param email email-adress
   * @param name name of user
   * @param status online or offline status
   * @param avatarUrl url of user image
   * @returns user object
   */
  createUser(email: string, name: string, status: string, avatarUrl: any): User {
    const user = {} as User
    user.email = email
    user.name = name;
    user.status = status;
    user.avatarUrl = avatarUrl;
    user.userId = '';
    user.usedLastTwoEmojis = ['✅', '🙌']
    user.uid = null;
    return user
  }


  /**
   * creates a channel object
   * @param createdBy user who created the channel
   * @param description description of the channel
   * @param membersId user id´s from the members of the channel
   * @param channelName name of the channel
   * @returns channel object
   */
  createChannel(createdBy: string, description: string, membersId: Array<string>, channelName: string): Channel {
    let channel = {} as Channel
    const randomNumber = Math.random();
    channel.createdAt = new Date();
    channel.createdBy = createdBy;
    channel.description = description;
    channel.membersId = membersId;
    channel.name = channelName;
    channel.channelId = 'CHA-' + createdBy + '-' + randomNumber;
    return channel
  }


  /**
   * creates a messageobject in a channel
   * @param channel channelobject
   * @param content content of the message
   * @param createdBy id of the creator of the message
   * @param fileUrl file url if the message is a file
   * @param threadId thread id if the message is within a thread
   * @returns messageobject
   */
  createChannelMessage(channel: Channel, content: string, createdBy: string, fileUrl?: string, threadId?: string): ChannelMessage {
    let channelMessage = {} as ChannelMessage
    const randomNumber = Math.random()
    channelMessage.channelId = channel.channelId;
    channelMessage.content = content;
    channelMessage.createdAt = Timestamp.fromDate(new Date());
    channelMessage.createdBy = createdBy;
    channelMessage.fileUrl = fileUrl ? fileUrl : '';
    channelMessage.threadId = threadId ? threadId : '';
    channelMessage.messageId = 'CHA-MSG-' + randomNumber
    return channelMessage
  }


  /**
   * create a reactionobject on a message
   * @param emoji selected emoji
   * @param userId id of the user who created the reaction
   * @param userName name of the user who created the reaction
   * @param channelMessage channelmessage object
   * @returns reaction object
   */
  createChannelMessageReaction(emoji: string, userId: string, userName: string, channelMessage: ChannelMessage): Reaction {
    let reaction = {} as Reaction;
    const randomNumber = Math.random()
    reaction.emoji = emoji;
    reaction.userId = userId;
    reaction.messageId = channelMessage.messageId;
    reaction.userName = userName;
    reaction.reactionId = 'CHA-MSG-REACT-' + randomNumber;
    return reaction
  }


  /**
   * conversation object
   * @param createdBy id of the user who created the conversation
   * @param recipientId id of the user who recieves the conversation
   * @returns conversation object
   */
  createConversation(createdBy: string, recipientId: string): Conversation {
    const conversation = {} as Conversation
    const randomNumber = Math.random();
    conversation.conversationId = 'CONV-' + createdBy + '-' + randomNumber;
    conversation.conversationNameCreator = 'Conversation with ' + recipientId;
    conversation.conversationNameRecipient = 'Conversation with ' + createdBy;
    conversation.createdBy = createdBy;
    conversation.fileUrl = 'null';
    conversation.recipientId = recipientId;
    return conversation;
  }


  /**
   * creates a messageobject in a conversation
   * @param conversation conversation object
   * @param content content of the message
   * @param createdBy id of the creator of the message
   * @param fileUrl file url if the message is a file
   * @param threadId thread id if the message is within a thread
   * @returns messageobject
   */
  createConversationMessage(conversation: Conversation, content: string, createdBy: string, fileUrl?: string, threadId?: string): ConversationMessage {
    let conversationMessage = {} as ConversationMessage;
    const randomNumber = Math.random();
    conversationMessage.conversationId = conversation.conversationId;
    conversationMessage.content = content;
    conversationMessage.createdAt = Timestamp.fromDate(new Date());
    conversationMessage.createdBy = createdBy;
    conversationMessage.fileUrl = fileUrl ? fileUrl : '';
    conversationMessage.threadId = threadId ? threadId : '';
    conversationMessage.messageId = 'CONV-MSG-' + randomNumber
    return conversationMessage
  }


  /**
   * create a reactionobject on a conversation
   * @param emoji selected emoji
   * @param userId id of the user who created the reaction
   * @param userName name of the user who created the reaction
   * @param conversationMessage conversationmessage object
   * @returns reaction object
   */
  createConversationMessageReaction(emoji: string, userId: string, userName: string, conversationMessage: ConversationMessage): Reaction {
    let reaction = {} as Reaction;
    const randomNumber = Math.random();
    reaction.emoji = emoji;
    reaction.userId = userId;
    reaction.userName = userName;
    reaction.messageId = conversationMessage.messageId;
    reaction.reactionId = 'CONV-MSG-REACT-' + randomNumber;
    return reaction
  }


  /**
   * creates a thread object
   * @param conversationMessage message object
   * @param sendingUser userobject of the user who sends the message
   * @param receivingUser userobject of the user who recieves the message
   * @returns trhead object
   */
  createThread(conversationMessage: ConversationMessage, sendingUser: User, receivingUser: User): Thread {
    let thread = {} as Thread;
    const randomNumber = Math.random();
    thread.conversationId = conversationMessage.conversationId;
    thread.messageId = conversationMessage.messageId;
    thread.threadId = 'THR-' + conversationMessage.createdBy + '-' + randomNumber;
    thread.threadNameCreator = sendingUser.name;
    thread.threadNameRecipient = receivingUser.name;
    thread.createdBy = sendingUser.userId
    thread.recipientId = receivingUser.userId;
    conversationMessage.threadId = thread.threadId;
    return thread;
  }


  /**
   * creates a message object for a thread
   * @param conversation conversationobject
   * @param content content of the message
   * @param createdBy user who created the message
   * @param thread thread of the message
   * @param fileUrl file url if the message is a file
   * @returns message object
   */
  createThreadMessage(conversation: Conversation, content: string, createdBy: string, thread: Thread, fileUrl?: string): ThreadMessage {
    let threadMessage = {} as ThreadMessage;
    const randomNumber = Math.random();
    threadMessage.threadMessageId = 'THR-MSG-' + randomNumber;
    threadMessage.conversationId = conversation.conversationId;
    threadMessage.content = content;
    threadMessage.createdAt = Timestamp.fromDate(new Date());
    threadMessage.createdBy = createdBy;
    threadMessage.threadId = thread.threadId
    threadMessage.messageId = thread.messageId
    threadMessage.fileUrl = fileUrl ? fileUrl : '';
    return threadMessage
  }


  /**
   * adds a threadobject to the database
   * @param thread threadobject
   */
  addThread(thread: Thread) {
    //add converstaion to creator
    setDoc(doc(this.firestore, 'users/' + thread.createdBy + '/conversations', thread.conversationId + '/conversationmessages/' + thread.messageId + '/threads/', thread.threadId), thread);
    //add conversation to recipient
    setDoc(doc(this.firestore, 'users/' + thread.recipientId + '/conversations', thread.conversationId + '/conversationmessages/' + thread.messageId + '/threads/', thread.threadId), thread);
  }


  /**
   * adds the thread message to the database
   * @param thread threadobject
   * @param threadMessage messageobject
   */
  addThreadMessage(thread: Thread, threadMessage: ThreadMessage) {
    //add Message to creator
    setDoc(doc(this.firestore, 'users/' + thread.createdBy + '/conversations', thread.conversationId + '/conversationmessages/' + thread.messageId + '/threads/', thread.threadId + '/threadmessages', threadMessage.threadMessageId), threadMessage);
    //add Message to recipient
    setDoc(doc(this.firestore, 'users/' + thread.recipientId + '/conversations', thread.conversationId + '/conversationmessages/' + thread.messageId + '/threads/', thread.threadId + '/threadmessages', threadMessage.threadMessageId), threadMessage);
  }


  /**
   * loads all messages of a specific thread
   * @param message conversationmessage object
   * @param sendingUser active user
   * @returns list of all threads of the active user
   */
  loadSpecificThread(message: ConversationMessage, sendingUser: User): Promise<Thread> {
    return new Promise<Thread>((resolve, reject) => {
      const threadObject = {} as Thread;
  
      const threadRef = doc(this.firestore, 'users/' + sendingUser.userId + '/conversations/', message.conversationId + '/conversationmessages/' + message.messageId + '/threads/' + message.threadId);
      
      onSnapshot(threadRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const threadData = docSnapshot.data();
          threadObject.conversationId = threadData['conversationId'];
          threadObject.messageId = threadData['messageId'];
          threadObject.threadId = threadData['threadId'];
          threadObject.threadNameCreator = threadData['threadNameCreator'];
          threadObject.threadNameRecipient = threadData['threadNameRecipient'];
          threadObject.createdBy = threadData['createdBy'];
          threadObject.recipientId = threadData['recipientId'];
          
          resolve(threadObject);
        } else {
          reject(new Error("Thread not found"));
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * loads all messages of a specific thread
   * @param thread specific thread
   * @returns list of thread messages
   */
  loadThreadMessages(thread: Thread): Promise<Array<ThreadMessage>> {
    return new Promise<Array<ThreadMessage>>((resolve, reject) => {
      const messageList = [] as Array<ThreadMessage>
      onSnapshot(collection(this.firestore, 'users/' + thread.createdBy + '/conversations', thread.conversationId + '/conversationmessages/' + thread.messageId + '/threads/', thread.threadId + '/threadmessages'), (messages) => {
        messages.forEach(message => {
          const messageData = message.data();
          const messageObject = {} as ThreadMessage;
          messageObject.threadMessageId = messageData ['threadMessageId']
          messageObject.conversationId = messageData['conversationId'];
          messageObject.content = messageData['content'];
          messageObject.createdAt = messageData['createdAt'];
          messageObject.createdBy = messageData['createdBy'];
          messageObject.fileUrl = messageData['fileUrl'];
          messageObject.threadId = messageData['threadId'];
          messageObject.messageId = messageData['messageId'];
          messageList.push(messageObject);
        })
        resolve(messageList);
      }, (error) => {
        reject(error)
      })
    })
    
    
    // users/Adxrm7CExizb76lVrknu/conversations/CONV-Adxrm7CExizb76lVrknu-0.9989840950446485/conversationmessages/CONV-MSG-0.22202702605541935/threads/THR-Adxrm7CExizb76lVrknu-0.4701011034717981
  }



/*Channel Thread Functions */

  /**
   * creates a thread object
   * @param channelMessage message object
   * @param sendingUser userobject of the user who sends the message
   * @param receivingUser userobject of the user who recieves the message
   * @returns thread object
   */
  createChannelThread(channelMessage: ChannelMessage, channel: Channel): ChannelThread {
    let thread = {} as ChannelThread;
    const randomNumber = Math.random();
    thread.channelId = channelMessage.channelId;
    thread.messageId = channelMessage.messageId;
    thread.threadId = 'THR-' + channelMessage.createdBy + '-' + randomNumber;
    thread.threadNameCreator = channel.createdBy;
    thread.threadNameRecipients = channel.membersId;
    thread.createdBy = channelMessage.createdBy
    thread.recipientIds = channel.membersId;
    channelMessage.threadId = thread.threadId;
    return thread;
  }

      /**
   * loads all messages of a specific thread
   * @param message conversationmessage object
   * @param sendingUser active user
   * @returns list of all threads of the active user
   */
      loadSpecificChannelThread(message: ChannelMessage, channel: Channel): Promise<ChannelThread> {
        return new Promise<ChannelThread>((resolve, reject) => {
          const threadObject = {} as ChannelThread;
      
          const threadRef = doc(this.firestore, 'users/' + channel.createdBy + '/channels/', message.channelId + '/channelmessages/' + message.messageId + '/threads/' + message.threadId);
          
          onSnapshot(threadRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const threadData = docSnapshot.data();
              threadObject.channelId = threadData['channelId'];
              threadObject.messageId = threadData['messageId'];
              threadObject.threadId = threadData['threadId'];
              threadObject.threadNameCreator = threadData['threadNameCreator'];
              threadObject.threadNameRecipients = threadData['threadNameRecipients'];
              threadObject.createdBy = threadData['createdBy'];
              threadObject.recipientIds = threadData['recipientIds'];
              
              resolve(threadObject);
            } else {
              reject(new Error("Thread not found"));
            }
          }, (error) => {
            reject(error);
          });
        });
      }

    /**
   * adds a threadobject to the database
   * @param thread threadobject
   */
    addChannelThread(thread: ChannelThread, channel: Channel) {
      
      channel.membersId.forEach(userId => {
        setDoc(doc(this.firestore, 'users/' + userId + '/channels/' + thread.channelId + '/channelmessages/' + thread.messageId + '/threads/', thread.threadId), thread);
      });
    }


  /*DONE */


    /**
   * updates the messageid of the thread object
   * @param thread threadobject
   * @returns error or confirmation message
   */
    updateMessageChannelThreadId(thread: ChannelThread, channel: Channel) {
    let channelThreadObject = new ChannelThread(thread);
    channel.membersId.forEach(user => {
      debugger;
      updateDoc(doc(collection(this.firestore, 'users/' + user + '/channels/' + thread.channelId + '/channelmessages/' + thread.messageId + '/threads/'), thread.threadId), channelThreadObject.toJSON());
    })
  }





/*TODO createchannelthreadmessage gibt conversationmessage zurück
hier mal checken ob ich einfach channelmessage returnen kann
*/


  /**
   * creates a message object for a thread
   * @param conversation conversationobject
   * @param content content of the message
   * @param createdBy user who created the message
   * @param thread thread of the message
   * @param fileUrl file url if the message is a file
   * @returns message object
   */
  createChannelThreadMessage(conversation: Conversation, content: string, createdBy: string, thread: Thread, fileUrl?: string): ConversationMessage {
    let threadMessage = {} as ThreadMessage;
    threadMessage.conversationId = conversation.conversationId;
    threadMessage.content = content;
    threadMessage.createdAt = Timestamp.fromDate(new Date());
    threadMessage.createdBy = createdBy;
    threadMessage.threadId = thread.threadId
    threadMessage.messageId = thread.messageId
    threadMessage.fileUrl = fileUrl ? fileUrl : '';
    return threadMessage
  }





  /**
   * adds the thread message to the database
   * @param thread threadobject
   * @param threadMessage messageobject
   */
  addChannelThreadMessage(thread: Thread, threadMessage: ThreadMessage) {
    //add Message to creator
    setDoc(doc(this.firestore, 'users/' + thread.threadNameCreator + '/threads/' + threadMessage.conversationId + '/threadmessages', threadMessage.messageId), threadMessage);
    //add Message to recipient
    setDoc(doc(this.firestore, 'users/' + thread.threadNameRecipient + '/threads/' + threadMessage.conversationId + '/threadmessages', threadMessage.messageId), threadMessage);
  }




  /*END CHANNEL THREAD FUNCTIONS */

  /*create database entry functions */

  /**
   * adds a user to the database
   * @param user user object
   */
  addUser(user: User) {
    addDoc(collection(this.firestore, 'users'), user.toJSON());
    //Add user ID to userobject in database
    onSnapshot(collection(this.firestore, 'users'), (foundUsers) => {
      const addedUser = {} as User
      foundUsers.forEach(foundUser => {
        const userData = foundUser.data();
        if (userData['email'] == user.email) {
          addedUser.email = userData['email']
          addedUser.name = userData['name']
          addedUser.status = userData['status']
          addedUser.avatarUrl = userData['avatarUrl']
          addedUser.userId = foundUser.id
          addedUser.usedLastTwoEmojis = userData['usedLastTwoEmojis']
          addedUser.uid = userData['uid']
        }
      })
      this.updateUser(addedUser);
    })
  }


  /**
   * adds a channel object to the database
   * @param channel channel object
   */
  addChannel(channel: Channel) {
    let channelObject = new Channel(channel)
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels', channel.channelId), channelObject.toJSON());
    });
  }


  /**
   * adds a channel message object to the database
   * @param channel channel object
   * @param channelMessage message object
   */
  addChannelMessage(channel: Channel, channelMessage: ChannelMessage) {
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/' + channel.channelId + '/channelmessages', channelMessage.messageId), channelMessage);
    });
  }


  /**
   * adds a reaction to a channel message object to the database
   * @param channel channel object
   * @param channelMessage message object
   * @param reaction reaction object
   */
  addChannelMessageReaction(channel: Channel, channelMessage: ChannelMessage, reaction: Reaction) {
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/'
        + channel.channelId + '/channelmessages/' + channelMessage.messageId + '/reactions', reaction.reactionId), reaction);
    });
  }


  /**
   * adds a conversation object to the database
   * @param conversation conversation object
   */
  addConversation(conversation: Conversation) {
    //add converstaion to creator
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations', conversation.conversationId), conversation);
    //add conversation to recipient
    if (!(conversation.createdBy == conversation.recipientId)) {
      setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations', conversation.conversationId), conversation);
    }
  }


  /**
   * adds a conversation message object to the database
   * @param conversation conversation object
   * @param conversationMessage message object
   */
  addConversationMessage(conversation: Conversation, conversationMessage: ConversationMessage) {
    //add Message to creator
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', conversationMessage.messageId), conversationMessage);
    //add Message to recipient
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', conversationMessage.messageId), conversationMessage);
  }


  /**
   * adds a reaction for a conversation message to the database
   * @param conversation conversation object
   * @param conversationMessage message object
   * @param reaction reaction object
   */
  addConversationMessageReaction(conversation: Conversation, conversationMessage: ConversationMessage, reaction: Reaction) {
    //add reaction to creator message
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations/'
      + conversation.conversationId + '/conversationmessages/' + conversationMessage.messageId + '/reactions', reaction.reactionId), reaction);
    //add reaction to recipient message
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations/'
      + conversation.conversationId + '/conversationmessages/' + conversationMessage.messageId + '/reactions', reaction.reactionId), reaction);
  }


  /*read functions */

  /**
   * loads a user with the specific email adress
   * @param email email adress of the user
   * @returns user object
   */
  getUser(email: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const activeUser = {} as User;
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          if (userData['email'] == email) {
            activeUser.email = userData['email']
            activeUser.name = userData['name']
            activeUser.status = userData['status']
            activeUser.avatarUrl = userData['avatarUrl']
            activeUser.userId = user.id
            activeUser.logIn = userData['logIn']
            activeUser.usedLastTwoEmojis = userData['usedLastTwoEmojis']
            activeUser.uid = userData['uid']
          }
        })
        resolve(activeUser);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads a user with the specific user id
   * @param userId user id
   * @returns user object
   */
  loadUser(userId: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const foundUser = {} as User;
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          if (user.id == userId) {
            foundUser.email = userData['email']
            foundUser.name = userData['name']
            foundUser.status = userData['status']
            foundUser.avatarUrl = userData['avatarUrl']
            foundUser.userId = user.id
            foundUser.usedLastTwoEmojis = userData['usedLastTwoEmojis']
            //added
            foundUser.uid = userData['uid']
            foundUser.logIn = userData['logIn']
          }
        })
        resolve(foundUser);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads a list with all user objects
   * @returns list of user objects
   */
  loadAllUsers(): Promise<Array<User>> {
    return new Promise<Array<User>>((resolve, reject) => {
      const userList = [] as Array<User>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          const userObject = {} as User;
          userObject.avatarUrl = userData['avatarUrl'];
          userObject.email = userData['email'];
          userObject.name = userData['name'];
          userObject.status = userData['status'];
          userObject.userId = user.id;
          userObject.usedLastTwoEmojis = userData['usedLastTwoEmojis']
          userList.push(userObject);
        })
        resolve(userList);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads a list of all channels
   * @returns list of all channels
   */
  loadAllChannels(): Promise<Array<Channel>> {
    return new Promise<Array<Channel>>((resolve, reject) => {
      const channelList = [] as Array<Channel>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        const channelPromises = [] as Array<Promise<void>>;
        users.forEach(user => {
          const channelPromise = new Promise<void>((resolveChannel, rejectChannel) => {
            onSnapshot(collection(this.firestore, 'users/' + user.id + '/channels'), (channels) => {
              channels.forEach(channel => {
                const channelData = channel.data();
                const channelObject = {} as Channel;
                channelObject.createdAt = channelData['createdAt'];
                channelObject.createdBy = channelData['createdBy'];
                channelObject.description = channelData['description'];
                channelObject.membersId = channelData['membersId'];
                channelObject.name = channelData['name'];
                channelObject.channelId = channelData['channelId'];
                channelList.push(channelObject);
              });
              resolveChannel();
            }, rejectChannel);
          });
          channelPromises.push(channelPromise);
        });
        Promise.all(channelPromises)
          .then(() => resolve(channelList))
          .catch(error => reject(error));
      }, reject);
    });
  }


  /**
   * loads a list of all channels where a specific user is a member
   * @param userId user id
   * @returns list of user channels
   */
  loadAllUserChannels(userId: string): Promise<Array<Channel>> {
    return new Promise<Array<Channel>>((resolve, reject) => {
      const channelList = [] as Array<Channel>
      const channelPromises = [] as Array<Promise<void>>
      const channelPromise = new Promise<void>((resolveChannel, rejectChannel) => {
        onSnapshot(collection(this.firestore, 'users/' + userId + '/channels'), (channels) => {
          channels.forEach(channel => {
            const channelData = channel.data();
            const channelObject = {} as Channel;
            channelObject.createdAt = channelData['createdAt'];
            channelObject.createdBy = channelData['createdBy'];
            channelObject.description = channelData['description'];
            channelObject.membersId = channelData['membersId'];
            channelObject.name = channelData['name'];
            channelObject.channelId = channelData['channelId'];
            channelList.push(channelObject);
          });
          resolveChannel();
        }, rejectChannel);
      });
      channelPromises.push(channelPromise);
      Promise.all(channelPromises)
        .then(() => resolve(channelList))
        .catch(error => reject(error));
    });
  }


  /**
   * loads one specific channel where a specific user is a member
   * @param userId user id
   * @param channelId channel id
   * @returns chnanel object
   */
  loadSpecificUserChannel(userId: string, channelId: string): Promise<Channel> {
    return new Promise<Channel>((resolve, reject) => {
      const channelObject = {} as Channel
      onSnapshot(collection(this.firestore, 'users/' + userId + '/channels'), (channels) => {
        channels.forEach(channel => {
          if (channelId == channel.id) {
            const channelData = channel.data();
            channelObject.createdAt = channelData['createdAt'];
            channelObject.createdBy = channelData['createdBy'];
            channelObject.description = channelData['description'];
            channelObject.membersId = channelData['membersId'];
            channelObject.name = channelData['name'];
            channelObject.channelId = channelData['channelId'];
          }
        })
        resolve(channelObject);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads a list of all messsages in all channels
   * @returns list of all messages created for channels
   */
  loadAllChannelMessages() {
    return new Promise<Array<ChannelMessage>>((resolve, reject) => {
      const messageList: Array<ChannelMessage> = [];
      const userPromises: Array<Promise<void>> = [];

      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const channelPromise = new Promise<void>((resolveChannel, rejectChannel) => {
            onSnapshot(collection(this.firestore, `users/${user.id}/channels`), (channels) => {
              const messagePromises: Array<Promise<void>> = [];
              channels.forEach(channel => {
                const messagePromise = new Promise<void>((resolveMessage, rejectMessage) => {
                  onSnapshot(collection(this.firestore, `users/${user.id}/channels/${channel.id}/channelmessages`), (messages) => {
                    messages.forEach(message => {
                      const messageData = message.data();
                      const messageObject: ChannelMessage = {
                        channelId: messageData['channelId'],
                        content: messageData['content'],
                        createdAt: messageData['createdAt'],
                        createdBy: messageData['createdBy'],
                        fileUrl: messageData['fileUrl'],
                        threadId: messageData['threadId'],
                        messageId: messageData['messageId'],
                        toJSON: function (): { channelId: string; content: string; createdAt: Timestamp; createdBy: string; fileUrl: string; threadId: string; messageId: string; } {
                          throw new Error('Function not implemented.');
                        }
                      };
                      messageList.push(messageObject);
                    });
                    resolveMessage();
                  }, rejectMessage);
                });
                messagePromises.push(messagePromise);
              });
              Promise.all(messagePromises).then(() => { resolveChannel() }).catch(rejectChannel);
            });
          });
          userPromises.push(channelPromise);
        });

        Promise.all(userPromises)
          .then(() => resolve(messageList))
          .catch(error => reject(error));
      }, reject);
    });
  }


  /**
   * loads all messages of a specific channel where a specific user is a member
   * @param userId user id
   * @param channelId channel id
   * @returns list of messages of a specific channel
   */
  loadChannelMessages(userId: string, channelId: string): Promise<Array<ChannelMessage>> {
    return new Promise<Array<ChannelMessage>>((resolve, reject) => {
      const messageList = [] as Array<ChannelMessage>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/channels/' + channelId + '/channelmessages'), (messages) => {
        messages.forEach(message => {
          const messageData = message.data();
          const channelMessageObject = {} as ChannelMessage;
          channelMessageObject.channelId = messageData['channelId'];
          channelMessageObject.content = messageData['content'];
          channelMessageObject.createdAt = messageData['createdAt'];
          channelMessageObject.createdBy = messageData['createdBy'];
          channelMessageObject.fileUrl = messageData['fileUrl'];
          channelMessageObject.threadId = messageData['threadId'];
          channelMessageObject.messageId = messageData['messageId'];
          messageList.push(channelMessageObject);
        })
        resolve(messageList);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads a specific message of a channel
   * @param userId user id
   * @param channelId channel id
   * @param messageId message id
   * @returns message object
   */
  loadSpecificChannelMessage(userId: string, channelId: string, messageId: string): Promise<ChannelMessage> {
    return new Promise<ChannelMessage>((resolve, reject) => {
      const specificMessage = {} as ChannelMessage
      onSnapshot(collection(this.firestore, 'users/' + userId + '/channels/' + channelId + '/channelmessages'), (messages) => {
        messages.forEach(message => {
          if (message.id == messageId) {
            const messageData = message.data()
            specificMessage.channelId = messageData['channelId'];
            specificMessage.content = messageData['content'];
            specificMessage.createdAt = messageData['createdAt'];
            specificMessage.createdBy = messageData['createdBy'];
            specificMessage.fileUrl = messageData['fileUrl'];
            specificMessage.threadId = messageData['threadId'];
            specificMessage.messageId = messageData['messageId'];
          }
        });
        resolve(specificMessage);
      }, (error) => {
        reject(error);
      });
    });
  }


  /**
   * loads all reactions of a message in a channel
   * @param userId user id
   * @param channelId channel id
   * @param channelMessageId message id
   * @returns list of reactions of a single message in the channel
   */
  loadChannelMessagesReactions(userId: string, channelId: string, channelMessageId: string): Promise<Array<Reaction>> {
    return new Promise<Array<Reaction>>((resolve, reject) => {
      const reactionList = [] as Array<Reaction>;

      const path = `users/${userId}/channels/${channelId}/channelmessages/${channelMessageId}/reactions`;
      const reactionsCollection = collection(this.firestore, path);

      onSnapshot(reactionsCollection, (snapshot) => {
        snapshot.forEach((doc) => {
          const reactionData = doc.data();
          const reactionObject = {
            emoji: reactionData['emoji'],
            messageId: reactionData['messageId'],
            reactionId: reactionData['reactionId'],
            userId: reactionData['userId'],
            userName: reactionData['userName'],
          } as Reaction;
          reactionList.push(reactionObject);
        });
        resolve(reactionList);
      }, (error) => {
        reject(error);
      });
    });
  }


  /* CONVERSATION FUNCTIONS*/

  /**
   * loads all conversations
   * @returns list of all conversations
   */
  loadAllConversations(): Promise<Array<Conversation>> {
    return new Promise<Array<Conversation>>((resolve, reject) => {
      const conversationList = [] as Array<Conversation>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        const conversationPromises = [] as Array<Promise<void>>
        users.forEach(user => {
          const conversationPromise = new Promise<void>((resolveConversation, rejectConversation) => {
            onSnapshot(collection(this.firestore, 'users/' + user.id + '/conversations'), (conversations) => {
              conversations.forEach(conversation => {
                const conversationData = conversation.data();
                const conversationObject = {} as Conversation;
                conversationObject.conversationId = conversationData['conversationId'];
                conversationObject.conversationNameCreator = conversationData['conversationNameCreator'];
                conversationObject.conversationNameRecipient = conversationData['conversationNameRecipient'];
                conversationObject.createdBy = conversationData['createdBy'];
                conversationObject.fileUrl = conversationData['fileUrl'];
                conversationObject.recipientId = conversationData['recipientId'];
                conversationList.push(conversationObject);
              });
              resolveConversation();
            }, rejectConversation)
          });
          conversationPromises.push(conversationPromise);
        });
        Promise.all(conversationPromises)
          .then(() => resolve(conversationList))
          .catch(error => reject(error));
      }, reject);
    });
  }


  /**
   * loads all conversations from a specific user
   * @param userId user id
   * @returns list of all conversations from a user
   */
  loadAllUserConversations(userId: string): Promise<Array<Conversation>> {
    return new Promise<Array<Conversation>>((resolve, reject) => {
      const ConversationList = [] as Array<Conversation>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
        conversations.forEach(conversation => {
          const conversationData = conversation.data();
          const conversationObject = {} as Conversation;
          conversationObject.conversationId = conversationData['conversationId'];
          conversationObject.conversationNameCreator = conversationData['conversationNameCreator'];
          conversationObject.conversationNameRecipient = conversationData['conversationNameRecipient'];
          conversationObject.createdBy = conversationData['createdBy'];
          conversationObject.fileUrl = conversationData['fileUrl'];
          conversationObject.recipientId = conversationData['recipientId'];
          ConversationList.push(conversationObject);
        })
        resolve(ConversationList);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads a specific conversation between two users
   * @param userId user id
   * @param conversationId conversation id
   * @returns conversation object
   */
  loadSpecificUserConversation(userId: string, conversationId: string): Promise<Conversation> {
    return new Promise<Conversation>((resolve, reject) => {
      const conversationObject = {} as Conversation
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
        conversations.forEach(conversation => {
          if (conversationId == conversation.id) {
            const conversationData = conversation.data();
            conversationObject.conversationId = conversationData['conversationId'];
            conversationObject.conversationNameCreator = conversationData['conversationNameCreator'];
            conversationObject.conversationNameRecipient = conversationData['conversationNameRecipient'];
            conversationObject.createdBy = conversationData['createdBy'];
            conversationObject.fileUrl = conversationData['fileUrl'];
            conversationObject.recipientId = conversationData['recipientId'];
          }
        })
        resolve(conversationObject);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads a list of all conversation messages
   * @returns list of all conversation messages
   */
  loadAllConversationMessages(): Promise<Array<ConversationMessage>> {
    return new Promise<Array<ConversationMessage>>((resolve, reject) => {
      const messageList: Array<ConversationMessage> = [];
      const userPromises: Array<Promise<void>> = [];
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const conversationPromise = new Promise<void>((resolveConversation, rejectConversation) => {
            onSnapshot(collection(this.firestore, `users/${user.id}/conversations`), (conversations) => {
              const messagePromises: Array<Promise<void>> = [];
              conversations.forEach(conversation => {
                const messagePromise = new Promise<void>((resolveMessage, rejectMessage) => {
                  onSnapshot(collection(this.firestore, `users/${user.id}/conversations/${conversation.id}/conversationmessages`), (messages) => {
                    messages.forEach(message => {
                      const messageData = message.data();
                      const messageObject: ConversationMessage = {
                        conversationId: messageData['conversationId'],
                        content: messageData['content'],
                        createdAt: messageData['createdAt'],
                        createdBy: messageData['createdBy'],
                        fileUrl: messageData['fileUrl'],
                        threadId: messageData['threadId'],
                        messageId: messageData['messageId'],
                        toJSON: function (): { conversationId: string; content: string; createdAt: Timestamp; createdBy: string; fileUrl: string; threadId: string; messageId: string; } {
                          throw new Error('Function not implemented.');
                        }
                      };
                      messageList.push(messageObject);
                    });
                    resolveMessage();
                  }, rejectMessage);
                });
                messagePromises.push(messagePromise);
              });
              Promise.all(messagePromises).then(() => { resolveConversation() }).catch(rejectConversation);
            });
          });
          userPromises.push(conversationPromise);
        });
        Promise.all(userPromises)
          .then(() => resolve(messageList))
          .catch(error => reject(error));
      }, reject);
    });
  }


  /**
   * loads all messages of a specific conversation
   * @param userId user id
   * @param conversationId conversation id
   * @returns list of conversation messages
   */
  loadConversationMessages(userId: string, conversationId: string): Promise<Array<ConversationMessage>> {
    return new Promise<Array<ConversationMessage>>((resolve, reject) => {
      const messageList = [] as Array<ConversationMessage>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations/' + conversationId + '/conversationmessages'), (messages) => {
        messages.forEach(message => {
          const messageData = message.data();
          const messageObject = {} as ConversationMessage;
          messageObject.conversationId = messageData['conversationId'];
          messageObject.content = messageData['content'];
          messageObject.createdAt = messageData['createdAt'];
          messageObject.createdBy = messageData['createdBy'];
          messageObject.fileUrl = messageData['fileUrl'];
          messageObject.threadId = messageData['threadId'];
          messageObject.messageId = messageData['messageId'];
          messageList.push(messageObject);
        })
        resolve(messageList);
      }, (error) => {
        reject(error)
      })
    })
  }


  /**
   * loads all reactions of a message in a conversation
   * @param userId user id
   * @param conversationId conversation id
   * @param conversationMessageId message id
   * @returns list of reactions of a conversation message
   */
  loadConversationMessagesReactions(userId: string, conversationId: string, conversationMessageId: string): Promise<Array<Reaction>> {
    return new Promise<Array<Reaction>>((resolve, reject) => {
      const reactionList = [] as Array<Reaction>;
      const path = `users/${userId}/conversations/${conversationId}/conversationmessages/${conversationMessageId}/reactions`;
      const reactionsCollection = collection(this.firestore, path);

      onSnapshot(reactionsCollection, (snapshot) => {
        snapshot.forEach((doc) => {
          const reactionData = doc.data();
          const reactionObject = {
            emoji: reactionData['emoji'],
            messageId: reactionData['messageId'],
            reactionId: reactionData['reactionId'],
            userId: reactionData['userId'],
            userName: reactionData['userName'],
          } as Reaction;
          reactionList.push(reactionObject);
        });
        resolve(reactionList);
      }, (error) => {
        reject(error);
      });
    });
  }


  /**
   * loads a single message in a conversation
   * @param userId user id
   * @param conversationId conversation id
   * @param messageId message id
   * @returns message object
   */
  loadSpecificConversationMessage(userId: string, conversationId: string, messageId: string): Promise<ConversationMessage> {
    return new Promise<ConversationMessage>((resolve, reject) => {
      const messageObject = {} as ConversationMessage
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations/' + conversationId + '/conversationmessages'), (messages) => {
        messages.forEach(message => {
          if (message.id == messageId) {
            const messageData = message.data();
            messageObject.conversationId = messageData['conversationId'];
            messageObject.content = messageData['content'];
            messageObject.createdAt = messageData['createdAt'];
            messageObject.createdBy = messageData['createdBy'];
            messageObject.fileUrl = messageData['fileUrl'];
            messageObject.threadId = messageData['threadId'];
            messageObject.messageId = messageData['messageId'];
          }
        })
        resolve(messageObject);
      }, (error) => {
        reject(error)
      })
    })
  }


  /*update functions */

  /**
   * updates the properties of a user object in the database
   * @param user user object
   */
  updateUser(user: User) {
    let userObject = new User(user)
    updateDoc(doc(collection(this.firestore, 'users/'), user.userId), userObject.toJSON());
  }


  /**
   * updates the properties of a channel object in the database
   * @param channel channel object
   */
  updateChannelMembers(channel: Channel) {
    let channelObject = new Channel(channel);
    channel.membersId.forEach(user => {
      updateDoc(doc(collection(this.firestore, 'users/' + user + '/channels/'), channel.channelId), channelObject.toJSON());
    })
  }


  /**
   * updates the properties of a channel object in the database
   * @param channel channel object
   */
  updateChannelName(channel: Channel) {
    channel.membersId.forEach(user => {
      updateDoc(doc(collection(this.firestore, 'users/' + user + '/channels/'), channel.channelId), channel.toJSON())
    })
  }


  /**
   * updates the last two emojis in the user object
   * @param userId user id
   * @param emoji1 emoji string 1
   * @param emoji2 emoji string 2
   */
  updateUsedLastTwoEmojis(userId: string, emoji1: string, emoji2: string) {
    updateDoc(doc(this.firestore, 'users', userId), 'usedLastTwoEmojis', [emoji1, emoji2]);
  }


  /**
   * updates the messageid of the thread object
   * @param thread threadobject
   * @returns error or confirmation message
   */
  updateMessageThreadId(thread: Thread) {
    const creatorMessageRef = doc(
      this.firestore,
      'users/' + thread.createdBy + '/conversations/' + thread.conversationId + '/conversationmessages',
      thread.messageId
    );

    const recipientMessageRef = doc(
      this.firestore,
      'users/' + thread.recipientId + '/conversations/' + thread.conversationId + '/conversationmessages',
      thread.messageId
    );

    return Promise.all([
      updateDoc(creatorMessageRef, { threadId: thread.threadId }),
      updateDoc(recipientMessageRef, { threadId: thread.threadId })
    ]).then(() => {
      console.log('Message updated successfully for both users');
    }).catch(error => {
      console.error('Error updating message: ', error);
    });

  }


  /**
   * updates message object from a conversation
   * @param message message object
   * @param conversation conversation object
   * @returns error or confirmation message
   */
  updateMessage(message: ConversationMessage, conversation: Conversation): Promise<void> {
    const creatorMessageRef = doc(
      this.firestore,
      'users/' + conversation.createdBy + '/conversations/' + message.conversationId + '/conversationmessages',
      message.messageId
    );

    const recipientMessageRef = doc(
      this.firestore,
      'users/' + conversation.recipientId + '/conversations/' + message.conversationId + '/conversationmessages',
      message.messageId
    );
    return Promise.all([
      updateDoc(creatorMessageRef, { content: message.content }),
      updateDoc(recipientMessageRef, { content: message.content })
    ]).then(() => {
      console.log('Message updated successfully for both users');
    }).catch(error => {
      console.error('Error updating message: ', error);
    });
  }


  /**
   * updates the message object in a channel
   * @param message message object
   * @param channel channel object
   */
  updateChannelMessage(message: ChannelMessage, channel: Channel) {
    let messageObject = new ChannelMessage(message);
    channel.membersId.forEach(user => {
      updateDoc(doc(collection(this.firestore, 'users/' + user + '/channels/' + message.channelId + '/channelmessages/'), message.messageId), messageObject.toJSON())
    })
  }


  /*delete functions */
  /**
   * deletes a channelobject from a specific user in the database
   * @param channel channel id
   * @param userId user id
   */
  deleteChannel(channel: Channel, userId: string) {
    deleteDoc(doc(collection(this.firestore, 'users/' + userId + '/channels/'), channel.channelId));
  }

}