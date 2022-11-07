import {BasePickerTypeInfo, DatabaseConfig, timestamp} from "@picker-cc/core";

export const dbConfig: DatabaseConfig<BasePickerTypeInfo> = {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./dev.db',
};

export const trackingFields = {
    createdAt: timestamp({
        access: { read: () => true, create: () => false, update: () => false },
        validation: { isRequired: true },
        defaultValue: { kind: 'now' },
        ui: {
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'read' },
        },
    }),
    updatedAt: timestamp({
        access: { read: () => true, create: () => false, update: () => false },
        db: { updatedAt: true },
        validation: { isRequired: true },
        ui: {
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'read' },
        },
    }),
};
