---
title: The Builder Instance
position: 5
layout: "@docs"
---

---
title: The Builder Instance
position: 5
layout: "@docs"
---

## What is the Builder Instance?

Builder Instances are fully functional apps running in Space, tied to a Project. You can use them for a few purposes:

- to test and debug your app on Space before releasing it to the world
- as a flexible personal copy of an app you built for your own use (though this has a few pitfalls)

Builder Instances offer all the features that normal Space apps offer, and are always based on a specific [Revision](/docs/en/build/fundamentals/development/pushing#the-space-build-pipeline) of a  [Project](/docs/en/build/fundamentals/development/projects).

## Updating a Builder Instance

Once you have pushed your local project to Builder using [`space push`](/docs/en/build/fundamentals/development/pushing), Builder will automatically take the newly created Revision and install it in your Builder Instance. The Builder instance is automatically added to your Canvas and can be used like any other app. 

## Accessing a Builder Instance

### On the Canvas

Your Builder Instance will automatically be added to your Canvas. Builder Instances are marked by a purple `DEV` indicator, and offer the all the Context Menu options of a normal Space app. They offer two additional options:

- **Open In Builder:** opens your Project within Builder
- **Unpin Instance**: removes your Builder Instance from the Canvas (you can repin it from Builder)

![builder-instance-1](/public/docs-assets/build/builder-instance-1.png)

### From Builder

You can also view your Builder instance via your Builder Project under the ”Develop” tab. Clicking the **Open Builder Instance** will open the instance. There is also an option to pin and unpin your Builder Instance to your Canvas.

![builder-instance-2](/public/docs-assets/build/builder-instance-2.png)

## Using a Builder Instance

### For Testing

The primary use case for the Builder Instance is to test your app before publishing it to others. You can think of it as a staging copy of your app that’s running in Space, where you can ensure everything works as intended. Once you're happy with your app, you can publish your app and share it with others around the world.

**Logs**

If your Builder Instance runs into a runtime error when handling a request, the error logs will be returned in the request’s response. All runtime logs, including the error logs, are stored for 14 days and can be viewed in the **Develop** tab of your Builder project under **“Runtime Logs”**.  They can also be accessed from your App’s context menu on the Canvas under **“View Logs”**.

/* tab */

**From your Builder Project**

![builder-instance-3](/public/docs-assets/build/builder-instance-3.png)

/* tab */

**From the Canvas Context Menu**

![builder-instance-4](/public/docs-assets/build/builder-instance-4.png)

The logs are sorted by time and can be filtered by a specific Micro using the dropdown. They are expandable to the full error stack trace, by clicking on any individual log. Runtime logs can help with debugging Space related errors and mis-configurations of your app.

### In Production

You can use your Builder Instance as a personal copy of your app in production, if you like. It has all the same features as any other Space app and is automatically kept up to date with your latest changes, through Revisions.

A few words of caution for this use case — since the Builder instance is automatically kept up to date, changes you push can break your app. Your Builder Instance also shares data with your entire project, including your [local development setup](/docs/en/build/fundamentals/development/local-development).

If you instead want to have a safer environment to run your app without sudden changes, you can [create and install releases](/docs/en/publish/intro) of your app.

## Storing Data

The Builder Instance shares its data with your whole Builder Project, which you can [develop against](/docs/en/build/fundamentals/data-storage#developing-with-base-and-drive). If you are [developing your app locally](/docs/en/build/fundamentals/development/local-development) using `space dev`, the data will be shared between your local environment and your Builder Instance. You can [view and update this data](/docs/en/use/your-data/guis) as you use your app from your Builder Project or the app’s context menu on the Canvas.

/* tab */

**From your Builder Project**

![builder-instance-5](/public/docs-assets/build/builder-instance-5.png)

/* tab */

**From the Instance’s Context Menu**

![builder-instance-6](/public/docs-assets/build/builder-instance-6.png)

## Environment Variables

Your Builder Instance has access to preset and custom environment variables. You can create environment variables for your app via the [`Spacefile`](/docs/en/build/reference/spacefile#env).

You can update your Builder Instance’s environment variables from your Builder Project or from the Instance’s context menu on the Canvas.

/* tab */

**From your Builder Project**

![builder-instance-7](/public/docs-assets/build/builder-instance-7.png)

/* tab */

**From your Instance’s Context Menu**

Navigate to your app on the Canvas, click "Settings" and then "Configuration". From there, you can update your environment variables.

![builder-instance-8](/public/docs-assets/build/builder-instance-8.png)

## Domains

Builder Instances have the same [Domain features as any Space App](/docs/en/use/space-apps/domains). You can access your Built-In Space Domain by opening the app, or from the Instance’s context menu on the Canvas.

/* tab */

**From your Builder Project**

You can add a custom domain through the “Configuration” sub-tab of the “Develop” tab in your Builder Project.

![builder-instance-9](/public/docs-assets/build/builder-instance-9.png)

/* tab */

**From your Instance’s Context Menu**

You can add a custom domain through the Instance’s context menu on the Canvas, using the "Domains" tab.

![builder-instance-10](/public/docs-assets/build/builder-instance-9.png)


## Scheduled Actions

Your Builder Instance also runs Scheduled Actions, which you can configure via the `Spacefile`. You can modify and disable Scheduled Actions, just like with any other app, via your Builder Project or through the Instance’s context menu on the Canvas.

/* tab */

**From your Builder Project**

**From your Instance’s Context Menu**

Open the "Settings" for your app and naviagte to the "Schedules" tab.

![builder-instance-12](/public/docs-assets/build/builder-instance-12.png)