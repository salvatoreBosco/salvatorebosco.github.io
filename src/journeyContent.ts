import {l,projects,type Local} from './data';

type Exhibit={title:Local;summary:Local;sections:{heading:Local;body:Local}[];tags:string[];projectIds?:string[]};
const section=(en:string,it:string,english:string,italian:string)=>({heading:l(en,it),body:l(english,italian)});
export const roomExhibits:Exhibit[][]=[
 [
  {title:l('Electronics training','Formazione elettronica'),summary:l('Technical high school • Diploma in Electronics, 2019.','Istituto tecnico • Diploma in Elettronica, 2019.'),sections:[
   section('Qualification','Titolo di studio','Diploma in Electronics at ITIS Magistri Cumacini, attended from 2014 to 2019.','Diploma in Elettronica presso ITIS Magistri Cumacini, frequentato dal 2014 al 2019.'),
   section('Technical foundation','Base tecnica','An electronics background that complements my current interests in software and hardware.','Una formazione elettronica che si affianca ai miei attuali interessi per software e hardware.')
  ],tags:['Electronics','2014–2019']},
  {title:l('Practical experience','Esperienze pratiche'),summary:l('Assembly, testing and troubleshooting electronic equipment.','Montaggio, collaudo e ricerca guasti su apparecchiature elettroniche.'),sections:[
   section('Electronics','Elettronica','Earlier work and internship experiences included assembling, testing, correcting and repairing electronic boards.','Tra le precedenti esperienze di stage e lavoro: montaggio, collaudo, correzione e riparazione di schede elettroniche.'),
   section('Installations','Installazioni','Earlier technical roles also included antenna and Wi-Fi installations and replacement of electricity meters. These are previous work experiences, not a list of school subjects.','Le precedenti attività tecniche comprendevano anche installazione di antenne e Wi-Fi e sostituzione di contatori elettrici. Si tratta di esperienze lavorative pregresse, non di un elenco di materie scolastiche.')
  ],tags:['Testing','Troubleshooting','Hardware']},
  {title:l('Hardware meets software','Hardware e software'),summary:l('A personal Arduino library for vehicle communication.','Una libreria Arduino personale per comunicare con i veicoli.'),sections:[
   section('Independent project','Progetto personale','I developed an Arduino library to interface with a vehicle OBD system through the KWP2000 communication protocol.','Ho sviluppato una libreria Arduino per interfacciarmi con il sistema OBD di un veicolo attraverso il protocollo di comunicazione KWP2000.'),
   section('Connection to this room','Collegamento alla stanza','This project illustrates the connection between electronics and software. It is a personal project, not a school assignment.','Il progetto illustra il collegamento tra elettronica e software. È un progetto personale, non un elaborato scolastico.')
  ],tags:['Arduino','C/C++','OBD','KWP2000'],projectIds:['kwp']}
 ],
 [
  {title:l('Computer Engineering','Ingegneria Informatica'),summary:l('Politecnico di Milano • Degree programme, ongoing.','Politecnico di Milano • Percorso universitario in corso.'),sections:[
   section('Academic path','Percorso accademico','I enrolled in Computer Engineering at Politecnico di Milano in 2020. My 2026 CV lists the programme as ongoing.','Ho iniziato il percorso di Ingegneria Informatica al Politecnico di Milano nel 2020. Nel CV 2026 gli studi risultano in corso.'),
   section('Education and work','Studio e lavoro','Since September 2022, my university path has overlapped with professional web development at TEA WEB.','Da settembre 2022 il percorso universitario si sovrappone all’esperienza professionale nello sviluppo web presso TEA WEB.')
  ],tags:['Computer Engineering','2020–Present']},
  {title:l('Independent learning','Formazione autonoma'),summary:l('Programming, React, React Native and ethical hacking courses.','Corsi di programmazione, React, React Native ed ethical hacking.'),sections:[
   section('Self-directed courses','Corsi autonomi','My earlier CV lists independent Udemy courses in programming, React, React Native and ethical hacking.','Il mio precedente CV riporta corsi autonomi su Udemy in programmazione, React, React Native ed ethical hacking.'),
   section('Continued learning','Apprendimento continuo','My current toolkit includes JavaScript, TypeScript, C, Node.js and other web technologies. These are professional and personal skills, not a list of university examinations.','Il mio stack attuale comprende JavaScript, TypeScript, C, Node.js e altre tecnologie web. Sono competenze professionali e personali, non un elenco di esami universitari.')
  ],tags:['React','React Native','JavaScript','C']},
  {title:l('Personal experiments','Progetti personali'),summary:l('Interactive 3D environments and desktop applications.','Ambienti 3D interattivi e applicazioni desktop.'),sections:[
   section('3D Art Gallery','Galleria d’arte 3D','A work-in-progress virtual gallery developed with Three.js to explore artworks and their information in an interactive space.','Una galleria virtuale in sviluppo con Three.js per esplorare opere e relative informazioni in uno spazio interattivo.'),
   section('Kart management','Gestionale Gokart','A desktop application built with Electron and Express for a kart team, including an interactive circuit map. Both are independent projects.','Un’applicazione desktop con Electron ed Express per una scuderia di kart, con mappa interattiva del circuito. Entrambi sono progetti autonomi.')
  ],tags:['Three.js','Electron','Express'],projectIds:['gallery','kart']}
 ],
 [
  {title:l('First professional role','Primo ruolo professionale'),summary:l('Web development internship • September 2022 – August 2023.','Tirocinio sviluppo web • Settembre 2022 – Agosto 2023.'),sections:[
   section('Role','Ruolo','I joined TEA WEB SAS in Como as a web development intern in September 2022, until August 2023.','Ho iniziato in TEA WEB SAS a Como come tirocinante nello sviluppo web a settembre 2022, fino ad agosto 2023.'),
   section('Next milestone','Passaggio successivo','In September 2023 I continued at the same company as a Full-stack Developer.','A settembre 2023 ho proseguito nella stessa azienda come Full-stack Developer.')
  ],tags:['TEA WEB','Web development','2022–2023']},
  {title:l('Development environment','Ambiente di sviluppo'),summary:l('Web, mobile and management systems at TEA WEB.','Web, mobile e gestionali nell’esperienza TEA WEB.'),sections:[
   section('Company experience','Esperienza aziendale','Across my time at TEA WEB, my CV records development and maintenance of management systems, web apps and mobile apps using React, React Native/Expo and Laravel.','Nel complesso del percorso in TEA WEB, il CV riporta sviluppo e manutenzione di gestionali, web app e app mobile con React, React Native/Expo e Laravel.'),
   section('Scope','Perimetro','The CV does not separate individual technologies or tasks by internship and subsequent employment; this exhibit describes the overall company experience.','Il CV non distingue le singole tecnologie e attività tra tirocinio e impiego successivo; questa postazione descrive il percorso aziendale complessivo.')
  ],tags:['React','React Native','Expo','Laravel']},
  {title:l('From trainee to developer','Da tirocinante a sviluppatore'),summary:l('A continuous professional journey at the same company.','Un percorso professionale continuativo nella stessa azienda.'),sections:[
   section('Timeline','Cronologia','September 2022: internship begins. August 2023: internship ends. September 2023: Full-stack Developer role begins.','Settembre 2022: inizio tirocinio. Agosto 2023: fine tirocinio. Settembre 2023: inizio ruolo Full-stack Developer.'),
   section('Working with others','Lavoro con gli altri','My overall professional experience includes requirements gathering and direct communication with clients, designers and the development team.','Il mio percorso professionale complessivo include raccolta requisiti e confronto diretto con clienti, designer e team di sviluppo.')
  ],tags:['Requirements','Collaboration','Development']}
 ],
 [
  {title:l('Web & mobile engineering','Sviluppo web e mobile'),summary:l('React, React Native/Expo, Laravel and end-to-end features.','React, React Native/Expo, Laravel e funzionalità end-to-end.'),sections:[
   section('Front-end','Front-end','Responsive interfaces, React, TypeScript, JavaScript, HTML, CSS, Material UI and Vite. My focus is connecting thoughtful interfaces with reliable systems.','Interfacce responsive, React, TypeScript, JavaScript, HTML, CSS, Material UI e Vite. Il mio focus è unire interfacce curate e sistemi affidabili.'),
   section('Back-end and integration','Back-end e integrazioni','Laravel, PHP, Node.js, Express and REST APIs. I work on end-to-end features and integrations between front-end and back-end.','Laravel, PHP, Node.js, Express e REST API. Mi occupo di funzionalità end-to-end e integrazioni tra front-end e back-end.'),
   section('Mobile','Mobile','Development and maintenance of mobile apps with React Native and Expo, including API integration and release workflows.','Sviluppo e manutenzione di app mobile con React Native ed Expo, comprese integrazioni API e flussi di rilascio.')
  ],tags:['React','TypeScript','Laravel','PHP','REST APIs','Expo'],projectIds:['esg','mobile']},
  {title:l('Engineering quality','Qualità del software'),summary:l('Debugging, refactoring, testing, code review and deployment.','Debugging, refactoring, testing, code review e deploy.'),sections:[
   section('Development workflow','Workflow di sviluppo','I use Git and GitLab for version control and work on debugging, refactoring, testing, code review and application deployments.','Utilizzo Git e GitLab per il versionamento e mi occupo di debugging, refactoring, testing, code review e deploy applicativi.'),
   section('AI-assisted development','Sviluppo assistito dall’AI','I use AI tools for code analysis, debugging, refactoring, tests and documentation, with human review and validation of the output.','Utilizzo strumenti AI per analisi del codice, debugging, refactoring, test e documentazione, mantenendo revisione e validazione umana dell’output.'),
   section('Example','Esempio','A collaborative workflow manager combines Kanban boards, drag and drop, permission-aware interfaces and concurrency validation.','Un gestionale collaborativo combina bacheche Kanban, drag and drop, interfacce basate sui permessi e verifica della concorrenza.')
  ],tags:['Git','GitLab','Testing','Code review','Deploy'],projectIds:['kanban']},
  {title:l('Product & collaboration','Prodotto e collaborazione'),summary:l('Requirements, clients, designers and real business workflows.','Requisiti, clienti, designer e flussi aziendali reali.'),sections:[
   section('Requirements to release','Dai requisiti al rilascio','I follow the software lifecycle from requirements gathering and direct discussion with clients, designers and developers to implementation, testing and deployment.','Seguo il ciclo di sviluppo dalla raccolta requisiti e dal confronto diretto con clienti, designer e sviluppatori fino a implementazione, test e deploy.'),
   section('Business applications','Applicazioni aziendali','Examples in this portfolio include a sustainability management platform, a shared mobile commerce architecture and collaborative boards. Professional source code remains private.','Gli esempi nel portfolio comprendono una piattaforma gestionale per la sostenibilità, un’architettura commerce mobile condivisa e bacheche collaborative. Il codice professionale rimane privato.'),
   section('Communication','Comunicazione','Italian is my native language and my CV lists English at B2 level.','L’italiano è la mia lingua madre e il CV riporta inglese a livello B2.')
  ],tags:['Full-stack','Requirements','Client communication','English B2'],projectIds:['esg','mobile','kanban']}
 ]
];
export function localExhibits(lang:'it'|'en'){
 return roomExhibits.map(room=>room.map(e=>({title:e.title[lang],text:e.summary[lang],sections:e.sections.map(s=>({heading:s.heading[lang],body:s.body[lang]})),tags:e.tags,projects:projects.filter(p=>e.projectIds?.includes(p.id)).map(p=>({title:p.name[lang],summary:p.summary[lang],contribution:p.contribution[lang],tech:p.tech}))})));
}
