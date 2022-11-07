import {bootstrap} from "@picker-cc/core";

import { pickerConfig } from './picker-cc'
bootstrap(pickerConfig)
    .then(app => {
        // if (process.env.RUN_JOB_QUEUE === '1') {
        //     app.get(JobQueueService).start()
        // }
    })
    .catch(err => {
        // tslint:disable-next-line
        console.log(err)
        process.exit(1)
    })
