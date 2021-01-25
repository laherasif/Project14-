#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AppsyncLambdaAsDatasourceStack } from '../lib/appsync-even';

const app = new cdk.App();
new AppsyncLambdaAsDatasourceStack(app, 'CdkAppSynceEventBridge');
