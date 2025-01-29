___
---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: eYY-3yp-project-template
title: Project Template
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template"

# **Safe Plus - Smart Safety Helmet**

---

<img src="./images/logo.webp"  width="200" height="200">

## Team
-  e20346, Samarakoon S.M.P.H. [email](mailto:e20346@eng.pdn.ac.lk)
-  e20378, Siriwardane I.A.U. [email](mailto:e20378@eng.pdn.ac.lk)
-  e20419, Wakkumbura M.M.S.S. [email](mailto:e20419@eng.pdn.ac.lk)
-  e20439, Wickramasinghe J.M.W.G.R.L. [email](e20439@eng.pdn.ac.lk)

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Data Flow](#data-flow)
4. [Detailed budget](#detailed-budget)
5. [Hardware & Software Designs](#hardware-and-software-designs)
6. [Testing](#testing)
7. [Conclusion](#conclusion)
8. [Links](#links)

## Introduction

Industrial workplaces, such as construction sites, factories, and mining zones, shows significant safety risks to workers due to environmental hazards, heavy machinery, and unpredictable conditions. Every year, thousands of accidents occur due to falls, exposure to toxic gases, and collisions with moving equipment. These incidents not only lead to injuries and fatalities but also result in financial losses for companies due to medical costs, downtime, and legal repercussions.

To address these challenges, Safe Plus introduces an advanced smart safety helmet that integrates real-time monitoring, impact detection, and emergency alert systems. By providing cutting-edge sensor technology and wireless communication, Safe Plus ensures worker safety through immediate hazard detection, automated alerts, and connectivity with supervisors.

The impact of Safe Plus is much more than preventing accidents. It helps companies follow safety rules, improves worker confidence, and ensures a safer environment. This solution also keeps up with modern technology trends to make workplaces smarter and safer.

## Solution Architecture

![Architecture](./images/architecture.png)

## Data Flow

![dataflow](./images/datafow.jpg)

## Detailed budget

All items and costs

![budget](./images/budget.jpg)

## Hardware and Software Designs

Detailed designs with many sub-sections

## Testing

Testing done on hardware and software, detailed + summarized results


## Conclusion

What was achieved, future developments, commercialization plans

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="\_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="\_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)


# eYY-3yp-project-template

This is a sample repository you can use for your Embedded Systems project. Once you followed these instructions, remove the text and add a brief introduction to here.

### Enable GitHub Pages

You can put the things to be shown in GitHub pages into the _docs/_ folder. Both html and md file formats are supported. You need to go to settings and enable GitHub pages and select _main_ branch and _docs_ folder from the dropdowns, as shown in the below image.

![image](https://user-images.githubusercontent.com/11540782/98789936-028d3600-2429-11eb-84be-aaba665fdc75.png)

### Special Configurations

These projects will be automatically added into [https://projects.ce.pdn.ac.lk](). If you like to show more details about your project on this site, you can fill the parameters in the file, _/docs/index.json_

```
{
  "title": "This is the title of the project",
  "team": [
    {
      "name": "Team Member Name 1",
      "email": "email@eng.pdn.ac.lk",
      "eNumber": "E/yy/xxx"
    },
    {
      "name": "Team Member Name 2",
      "email": "email@eng.pdn.ac.lk",
      "eNumber": "E/yy/xxx"
    },
    {
      "name": "Team Member Name 3",
      "email": "email@eng.pdn.ac.lk",
      "eNumber": "E/yy/xxx"
    }
  ],
  "supervisors": [
    {
      "name": "Dr. Supervisor 1",
      "email": "email@eng.pdn.ac.lk"
    },
    {
      "name": "Supervisor 2",
      "email": "email@eng.pdn.ac.lk"
    }
  ],
  "tags": ["Web", "Embedded Systems"]
}
```

Once you filled this _index.json_ file, please verify the syntax is correct. (You can use [this](https://jsonlint.com/) tool).

### Page Theme

A custom theme integrated with this GitHub Page, which is based on [github.com/cepdnaclk/eYY-project-theme](https://github.com/cepdnaclk/eYY-project-theme). If you like to remove this default theme, you can remove the file, _docs/\_config.yml_ and use HTML based website.
