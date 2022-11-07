import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestContext, EventBus } from "@pickerjs/core";
export declare class UsersController {
    private readonly usersService;
    private readonly eventBus;
    constructor(usersService: UsersService, eventBus: EventBus);
    create(createUserDto: CreateUserDto): string;
    findAll(ctx: RequestContext): Promise<string>;
    findOne(id: string): string;
    update(id: string, updateUserDto: UpdateUserDto): string;
    remove(id: string): string;
}
