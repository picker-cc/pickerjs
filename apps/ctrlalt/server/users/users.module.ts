import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {ConfigModule} from "@pickerjs/core";
import {WeChatModule} from "@pickerjs/wechat-plugin";

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
