import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from "@pickerjs/core";
export declare class UsersService {
    private readonly configService;
    constructor(configService: ConfigService);
    create(createUserDto: CreateUserDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateUserDto: UpdateUserDto): string;
    remove(id: number): string;
}
