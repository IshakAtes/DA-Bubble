import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { ChannelComponent } from './channel/channel.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DialogChooseAvatarComponent } from './dialog-choose-avatar/dialog-choose-avatar.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { MainComponent } from './main/main.component';


export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'chat', component: ChatComponent },
    { path: 'workspace', component: WorkspaceComponent},
    { path: 'channel', component: ChannelComponent},
    { path: 'imprint', component: ImprintComponent},
    { path: 'privacyPolicy', component: PrivacyPolicyComponent},
    { path: 'signUp', component: SignUpComponent},
    { path: 'choosingAvatar', component: DialogChooseAvatarComponent},
    { path: 'thread', component: ThreadComponent},
    { path: 'main', component: MainComponent},
];
