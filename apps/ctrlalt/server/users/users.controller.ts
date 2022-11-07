import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {Ctx, RequestContext, EventBus} from "@picker-cc/core";

import {
    WeChat,
    ApiConfigKit,
    QyApiConfigKit,
    AccessToken,
    QyAccessTokenApi,
    Kits,
    HttpKit,
    ApiConfig,
} from 'tnwx';
import {SmsEvent} from "@picker-cc/ali-sms-plugin";
import {generateCode} from "@picker-cc/common/lib/generate-public-id";
@Controller('/v1/api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly eventBus: EventBus
        // private readonly eventService: EventBusService
    ) {
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {

        return this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(@Ctx() ctx: RequestContext) {
        // let devApiConfig = new ApiConfig('wx40f58df735cd2868', '97fe8be8948c6819bd8b547951201a45','PickerCc');

        // 微信公众号、微信小程序、微信小游戏 支持多应用
        // ApiConfigKit.putApiConfig(devApiConfig);
        // 开启开发模式,方便调试
        // ApiConfigKit.devMode = true;
        // 设置当前应用
        // ApiConfigKit.setCurrentAppId(devApiConfig.getAppId);
        // const userType: Models.User
        // const { picker:  } = ctx
        // const {User} = ctx.picker.sudo().query
       // const queryUser = await User.findMany({
       //  })
       //  console.log(queryUser)
       //  const queryUser = await ctx.picker.db.User.findMany({})
        // const users = await ctx.picker.db.User.findMany({
        // })
        // console.log(queryUser)

        this.eventBus.publish(new SmsEvent('verification', '13488689885', generateCode(6)));

        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
