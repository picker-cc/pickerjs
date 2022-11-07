import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {ConfigModule} from "@picker-cc/core";
import {WeChatModule} from "@picker-cc/wechat-plugin";

@Module({
    imports: [
        ConfigModule,
        WeChatModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {
}
