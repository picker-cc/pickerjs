import { bootstrapWorker } from '@picker-cc/core';

import { pickerConfig } from './picker-cc';

bootstrapWorker(pickerConfig)
    .then(worker => worker.startJobQueue())
    // .then(worker => worker.startHealthCheckServer({ port: 3001 }))
    .catch(err => {
        // tslint:disable-next-line
        console.log(err);
        process.exit(1);
    });
