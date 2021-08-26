# Sugar CRM x Amazon Fraud Detector

SugarCRM Amazon Fraud Detector is a NodeJS app that automates the fraud detection workflow by creating and tearing down AWS resources. This Node app uses a [standard architecture](https://softwareontheroad.com/ideal-nodejs-project-structure/) that should be really easy to follow and most importantly, it takes care of all the dependencies that are required while setting up AWS.

## Contents

[Installation instructions](#installation-instructions) 

[Configurations](#configurations) 

[Creating](#setting-up-your-development-environment) 

[Tearing Down](#setting-up-your-development-environment) 

[Contribute to this project](#contribute-to-this-project)

## Installation instructions

### Prerequisites
- NodeJS v16.5.0 (or newer) installed.  Check [Install NodeJS](https://nodejs.dev/learn/how-to-install-nodejs) for help.

### Clone and install dependencies
This project contains few dependencies that need to be installed for it to work, those are downloaded from [npm's public registry](https://www.npmjs.com/). 

Follow these steps to clone and install those dependencies.

1. Clone this repository
1. Enter in the folder
1. Install dependencies

```
git clone https://github.com/sugarcrm-developers/sugar-fraud-detector.git
cd sugar-fraud-detector
npm install
```
   
## Configurations
There are two types of configuration for this project to work, one is related to AWS, where we set them in the ```.env``` file and the other is related to the Fraud Detector resources you will create in your account in AWS. 

### AWS SDK

AWS access and secret keys were provided by step five when creating a new user, you should have them, just copy them and place on those placeholders down below as well as choose a region where you’d like to have your Fraud Detection setup.

If you dont have or lost your access/secret keys, check [this post](https://aws.amazon.com/blogs/security/how-to-find-update-access-keys-password-mfa-aws-management-console/), it helps you to generate a new one.

As part of this project we've provided a template called ```.env-template``` that you can rename it to ```.env``` and update with your data accordingly.

```
AWS_ACCESS_KEY_ID=<YOUR KEY>
AWS_SECRET_ACCESS_KEY=<YOUR SECRET>
AWS_API_REGION=<YOUR REGION>
AWS_DEFAULT_REGION=<YOUR REGION>

DEBUG=sugar:frauddetector:*
```

### SugarCRM Fraud Detector's metadata configuration

This file is located at [```src/config/index.js```](src/config/index.js) and contains the metadata for SugarFraudDetector uses to create all the necessary resources in AWS. It is self-explanatory and has been coded in a resourceful way so you can just update/adapt for your needs. Within **fraudDetector** you will notice there’s definitions for account and transaction, each with its own metadata as well as a **variables** section which contains the fields your model uses to train subsequently used in your request events when asking for predictions from AWS service.

It has been configured to perform the tasks described in the blog series, but feel free to change as needed.

## Apps
There are two apps ```create``` and ```teardown``` that you can execute each will do its job respecting all the dependencies required by AWS. Both apps use the metadata configuration above to perform its tasks. Both apps provide an extensive logging capabilities so you know what the app is doing.

### Create

Reads the metadata configuration and creates all resources in AWS required by Fraud Detector. It does create IAM roles and permissions, S3 bucket, uploads files and obvioulsy Fraud detector resources.

```javascript
npm run create
```

### Teardown

Tearing down all the resources is as important, if not more, than creating them, this is where you stop paying for your resources (if you’re not in the trial period of course).


```javascript
npm run teardown
```

### Filter by Date Utility

As pointed out in our [Adding AWS powered fraud detection to Sugar Sell - Part 2
](https://sugarclub.sugarcrm.com/dev-club/b/dev-blog/posts/adding-aws-powered-fraud-detection-to-sugarcrm-part-2), this script stored in [```src/scripts/filter-by-date.py```](src/scripts/filter-by-date.py) Python script to help filtering and preparing your data for public datasets.

## Contribute to this project
Sugar Fraud Detector is [open source](LICENSE), and we would love for you 
to get involved!  Below are some ways you can contribute to this project:
- Get notifications about this repo by clicking the **Watch** button at the top of this 
[repo](https://github.com/sugarcrm-developers/sugar-fraud-detector.git).
- Explore the code and use it as a resource as you develop your integrations and customizations.
- Create a [new Issue](https://github.com/sugarcrm-developers/sugar-fraud-detector/issues/new) if you have ideas for improvement, a feature 
request, or a bug report.
- Assign yourself an Issue, update the code, and create a pull request.  See [CONTRIBUTING.MD](CONTRIBUTING.md) for
more details.

