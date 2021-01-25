import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'
import { EVENT_SOURCE, requestTemplate, responseTemplate } from '../utility/uitility'
export class AppsyncLambdaAsDatasourceStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        ///APPSYNC API gives you a graphql api with api key
        const api = new appsync.GraphqlApi(this, "GRAPHQL_API", {
            name: 'cdk-api',
            schema: appsync.Schema.fromAsset('graphql/schema.gql'),       ///Path specified for lambda
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,     ///Defining Authorization Type

                },
            },
            xrayEnabled: true                                             ///Enables xray debugging
        })

        ///Print Graphql Api Url on console after deploy
        new cdk.CfnOutput(this, "APIGraphQlURL", {
            value: api.graphqlUrl
        })

        ///Print API Key on console after deploy
        new cdk.CfnOutput(this, "GraphQLAPIKey", {
            value: api.apiKey || ''
        });



        ////Set lambda as a datasource


        const todosLambda: any = new lambda.Function(this, 'AppSyncNotesHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            memorySize: 1024
        });


        const todosTable = new dynamodb.Table(this, 'CDKTodosTable', {
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
        });

        todosLambda.addEnvironment('TODOS_TABLE', todosTable.tableName);
        todosTable.grantFullAccess(todosLambda)

        const todoDs = api.addDynamoDbDataSource('lambdaDatasource', todosTable);


        const httpEventTriggerDS: any = api.addHttpDataSource(
            "eventTriggerDS",
            "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
            {
                name: "httpDsWithEventBridge",
                description: "From Appsync to Eventbridge",

            }
        );
        events.EventBus.grantPutEvents(httpEventTriggerDS);


        /* Query */
        todoDs.createResolver({
            typeName: "Query",
            fieldName: "getTodos",
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
        });

        /* Mutation */
        const mutations = ["addTodo", "deleteTodo", "updateTodo"]
        let details =""

        mutations.forEach((mut) => {

            if (mut === 'addTodo') {
                details = `\\\"title\\\":\\\"$ctx.args.todo.title\\\"`
            }

            httpEventTriggerDS.createResolver({
                typeName: "Mutation",
                fieldName: mut,
                requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
                responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
            });
        })

        
        new events.Rule(this, "eventConsumerRule", {
            eventPattern: {
              source: [EVENT_SOURCE],
              detailType: [...mutations,],
            },
            targets: [new targets.LambdaFunction(todosLambda)],
          });

        // lambdaDs.createResolver({
        //   typeName: "Query",
        //   fieldName: "getTodos"
        // });

        // lambdaDs.createResolver({
        //   typeName: "Mutation",
        //   fieldName: "addTodo"
        // });

        // lambdaDs.createResolver({
        //   typeName: "Mutation",
        //   fieldName: "updateTodo"
        // });

        // lambdaDs.createResolver({
        //   typeName: "Mutation",
        //   fieldName: "deleteTodo"
        // });






    }

}

