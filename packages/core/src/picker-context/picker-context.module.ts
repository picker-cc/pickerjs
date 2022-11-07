import { DynamicModule, Global, Module } from '@nestjs/common';

import { Picker } from './picker-context';

@Global()
@Module({
    providers: [Picker],
    exports: [Picker],
})
export class PickerContextModule {}
