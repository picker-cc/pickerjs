import {bootstrap} from "@pickerjs/core";

import { config } from './picker-config'
bootstrap(config)
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
