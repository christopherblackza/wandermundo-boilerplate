#!/bin/bash
ng build --configuration production --aot 
aws s3 cp ./dist/browser s3://wandermundo.com --recursive