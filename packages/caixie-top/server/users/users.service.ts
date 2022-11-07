import {Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {ConfigService} from "@picker-cc/core";

@Injectable()
export class UsersService {
    constructor(
        private readonly configService: ConfigService,
    ) {

    }

    create(createUserDto: CreateUserDto) {
        // configService.context.db['User'].findMany()
        return `This action adds a new user with dto ${JSON.stringify(
            createUserDto,
        )}`;
    }

    findAll() {
        // this.configService.context().db
        return `This action returns all users`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user with dto ${JSON.stringify(
            updateUserDto,
        )}`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
