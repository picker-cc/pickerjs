import fs from 'fs';
import http from 'http';
import fetch from 'node-fetch'
import {buildSchema, getIntrospectionQuery} from 'graphql/utilities';
import {buildClientSchema, printSchema} from "graphql";
import axios from "axios";

export const API_PORT = 5001;

/**
 * 生成 自省 文件
 * Makes an introspection query to the Picker server and writes the result to a
 * schema.json file.
 *
 * If there is an error connecting to the server, the promise resolves to false.
 */
export function downloadIntrospectionSchema(apiPath: string, outputFilePath: string): Promise<boolean> {
    // return new Promise((resolve, reject) => {
    //
    //     fetch(`localhost:${API_PORT}/${apiPath}`, {
    //         method: 'POST',
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             query: getIntrospectionQuery(),
    //         }),
    //     })
    //         .then(res => res.json())
    //         .then((schemaJSON: any) => printSchema(buildClientSchema(schemaJSON.data)))
    //         .then(clientSchema => {
    //                 console.log(clientSchema)
    //             return true
    //             }
    //             // fs.writeFileSync(
    //             //     path.join(__dirname, '..', 'schema.graphql'),
    //             //     clientSchema,
    //             // ),
    //         );
    // })
    const body = JSON.stringify({query: getIntrospectionQuery()});
    // console.log('查询自省文件')
    // console.log(body)
    let count = 1
    return new Promise((resolve, reject) => {
      const request = http.request(
        {
          method: 'post',
          host: 'localhost',
          port: API_PORT,
          path: '/' + apiPath,
            // path: 'http://localhost:5001/admin-api',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        response => {
          const outputFile = fs.createWriteStream(outputFilePath);
          response.pipe(outputFile);
          // response.on('data', function (chunk) {
          //     console.log(count++)
          //     console.log(chunk.toString())
          // })
            // bug: 文件未写完就停止
          // response.on('end', () => {
          //     console.log('end ...')
              // resolve(true)
          // });
            outputFile.on('finish', () => {
                resolve(true)
            })
          response.on('error', reject);
        },
      );
      request.write(body);
      request.end();
      request.on('error', (err: any) => {
        if (err.code === 'ECONNREFUSED') {
          console.error(
            `ERROR: Could not connect to the Picker server at http://localhost:${API_PORT}/${apiPath}`,
          );
          resolve(false);
        }
        reject(err);
      });
    });
    /*
    return new Promise((resolve, reject) => {
        axios.post(`http://localhost:5001/admin-api`, {
            query: getIntrospectionQuery(),
        }, {
            responseType: 'stream'
        }).then(res => {
            // console.log(res)
            // console.log(res.data.data)
            // const stream = res.data
            const outFile = fs.createWriteStream(outputFilePath)
            res.data.pipe(outFile)
            // res.data.on('data', (chunk) => {
            //     console.log(chunk.toString())
            // })
            res.data.on('end', () => {
                console.log('end ...')
            })
            // res.on('end', () => resolve(true))
            // const schema = buildClientSchema(res.data.data)
            //
            // console.log(schema)
            // const sdl = printSchema(schema)
            // console.log(sdl)
        })
    })
*/
}
