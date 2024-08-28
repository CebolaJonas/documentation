---
title: Datadog Service Owners Guide
description: Setup and implement Datadog as a Service owner to avoid pit-falls down the road
further_reading:
- link: "/logs/"
  tag: "Documentation"
  text: "Collect your logs"
---

# Welcome

Datadog is a single observability platform that provides visibility into the health and performance of your underlying infrastructure, services, applications, and more. Its features and capabilities are vast and powerful, but it can be hard to know where to start or how to configure it optimally to fit your use case.

If you've been tasked with designing, implementing, and managing an enterprise-grade installation of Datadog, you've come to the right place. Not to be confused with our [documentation][1], this guide provides best practices, standards, and examples to help you set up a production environment that matches your workloads and deployment needs, while avoiding large pitfalls down the road.

Once you've followed this guide to implement Datadog to scale with your organization, you can start managing your product efficiently without worrying about hardware refreshes, OS patches, server updates, or cluster re-balance details. Instead, you can focus on the refinements, analytics, and the data that comes with a well-formed observability system.  

## How to use this guide

This guide is organized into three sections that provide important concepts, plans, tasks, and structures to create and streamline your Datadog ownership experience:

* **Plan**: Learn the parts of Datadog that are important to your use case, build a knowledge base, develop some practical experience, plan your implementation, and utilize best practices when configuring your observability platform.  
* **Build**: Understand what needs to be installed and the best way to get it done so you can implement a Datadog environment that is best suited to your needs.  
* **Run**: Execute the internal and external tasks to maintain the Datadog service, maximize its power, and manage ongoing support.

{{< img src="/getting_started/service_owners_guide/plan_build_run.png" alt="Diagram of the plan, build, and run phases" style="width:80%;">}}

## Getting help

### Self-service resources

As you go along in this guide, you can refer to the following self-service resources:

* The Datadog [documentation][1], especially the [getting started][2] pages, to familiarize yourself with the platform further.  
* The Datadog UI, which provides in-context help that is accessible from any page.
* For information on specific configuration boxes, release notes, and other resources, click the `"?"` icon throughout the app, or the bottom left hand side within the interface.

{{< img src="/getting_started/service_owners_guide/help_center.png" alt="Screen shot of the help center in the Datadog UI">}}


* [Bits-AI][3] (in-app), which is a platform-wide AI assisted troubleshooter that helps you identify and remediate issues in your applications and infrastructure.  
* Datadog training courses (suggested courses [here]).

### File a support ticket

Datadog makes it easy to get support when you've run into a problem without having to worry about gathering the relevant information and sharing it securely and efficiently.

* [Datadog Support][4] is available to help with difficult issues, guide implementations, translate implementations into local conditions, identify bugs, and log feature requests.  
* For an automated interaction with Datadog support, use Datadog Agent flare, which is a CLI tool that creates a new ticket, then automatically redacts sensitive information in all the relevant log files, debug level settings, and local configs before sending it in a zipped file to Datadog support, no login required. For information on how to use and send the flare to Datadog support, see [sending a flare][5].  
* Additionally, In-App, Datadog's [Fleet Automation][6] can perform the Flare remotely, from within the Platform UI.


[1]: https://docs.datadoghq.com/
[2]: /getting_started/
[3]: /bits_ai/
[4]: /help/
[5]: /agent/troubleshooting/send_a_flare
[6]: /agent/fleet_automation/

## Further Reading

{{< partial name="whats-next/whats-next.html" >}}