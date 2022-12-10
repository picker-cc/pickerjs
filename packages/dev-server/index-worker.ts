import { bootstrapWorker } from '@pickerjs/core';
import { config } from './picker-config';

bootstrapWorker(config)
  .then(worker => worker.startJobQueue())
  // .then(worker => worker.startHealthCheckServer({ port: 3001 }))
  .catch(err => {
    // tslint:disable-next-line
    console.log(err);
    process.exit(1);
  });
