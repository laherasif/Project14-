

import { EventBridgeEvent, Context } from 'aws-lambda';
import * as AWS from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TODOS_TABLE as string;

export const handler = async (event: EventBridgeEvent<string , any > , context : Context) => {

    console.log(JSON.stringify(event, null, 2));

    try {
        //////////////  adding new time slot /////////////////////////
        if (event["detail-type"] === "addTodo") {
            // console.log("detail===>", JSON.stringify(event.detail, null, 2));
            let params = {
                TableName: TABLE_NAME,
                Item: { id: "1", ...event.detail , done : false }
            }
            await docClient.put(params).promise();
        }

        //////////////  deleting time slot /////////////////////////
        else if (event["detail-type"] === "deleteTimeSlot") {
            // console.log("detail===>", JSON.stringify(event.detail, null, 2));
            const params = {
                TableName: TABLE_NAME,
                Key: { id: event.detail.id },
            }
            await docClient.delete(params).promise();
        }
    }
    catch (error) {
        console.log("error ", error)
    }
}





// async function addTodo(todo: Todo) {
//     let params = {
//         TableName: process.env.TODOS_TABLE,
//         Item: todo
//     }

//     try {
//         await docClient.put(params).promise();
//         return todo

//     }
//     catch (e) {
//         console.info("error in dynamo db ", e)
//         return null

//     }
// }

// async function deleteTodo(todoId: string) {
//     const params = {
//         TableName: process.env.TODOS_TABLE,
//         Key: {
//             id: todoId
//         }
//     }
//     try {
//         await docClient.delete(params).promise()
//         return todoId
//     } catch (err) {
//         console.log('DynamoDB error: ', err)
//         return null
//     }
// }

// type Params = {
//     TableName: string | undefined,
//     Key: string | {},
//     ExpressionAttributeValues: any,
//     ExpressionAttributeNames: any,
//     UpdateExpression: string,
//     ReturnValues: string
// }

// async function updateTodo(todo: any) {
//     let params: Params = {
//         TableName: process.env.TODOS_TABLE,
//         Key: {
//             id: todo.id
//         },
//         ExpressionAttributeValues: {},
//         ExpressionAttributeNames: {},
//         UpdateExpression: "",
//         ReturnValues: "UPDATED_NEW"
//     };
//     let prefix = "set ";
//     let attributes = Object.keys(todo);
//     for (let i = 0; i < attributes.length; i++) {
//         let attribute = attributes[i];
//         if (attribute !== "id") {
//             params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
//             params["ExpressionAttributeValues"][":" + attribute] = todo[attribute];
//             params["ExpressionAttributeNames"]["#" + attribute] = attribute;
//             prefix = ", ";
//         }
//     }

//     try {
//         await docClient.update(params).promise()
//         return todo
//     } catch (err) {
//         console.log('DynamoDB error: ', err)
//         return null
//     }
// }


// async function getTodo() {

//     let params = {
//         TableName: process.env.TODOS_TABLE
//     }

//     try {
//         const data = await docClient.scan(params).promise()
//         return data.Items
//     }
//     catch (error) {
//         console.log("erorr during fetch data ", error);

//     }

// }

