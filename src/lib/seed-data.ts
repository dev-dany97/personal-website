import type { DatabaseSync } from 'node:sqlite';

// One-time seed of the SQLite database from the content that used to be
// hardcoded directly in the page components. This is the source of truth
// until an editing UI exists — delete data/content.db to reseed from here.

// Large video files are hosted on S3/CloudFront rather than bundled under
// /public (they'd blow past GitHub's file size limit and bloat every
// deploy). Falls back to the local /public/videos path when unset, e.g.
// for local dev.
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '';

// `prepare` runs inside the same transaction, before any row is inserted, so a
// caller can drop/recreate tables and seed atomically.
export function seedDatabase(db: DatabaseSync, prepare?: (db: DatabaseSync) => void) {
  db.exec('BEGIN');
  try {
    prepare?.(db);
    seedPageContent(db);
    seedHome(db);
    seedProjects(db);
    seedTravel(db);
    seedSetup(db);
    seedFinance(db);
    seedResume(db);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function insertPage(db: DatabaseSync, page: string, en: unknown, de: unknown) {
  db.prepare('INSERT INTO page_content (page, data_en, data_de) VALUES (?, ?, ?)').run(
    page,
    JSON.stringify(en),
    JSON.stringify(de)
  );
}

function seedPageContent(db: DatabaseSync) {
  insertPage(
    db,
    'home',
    {
      heroTitle1: 'Welcome to my',
      heroTitle2: 'Website',
      heroSubtitle: "I'm glad you're here.",
      heroCta: 'More about me',
      aboutHeading: "Hi, I'm Daniel!",
      aboutTags: ['Software Engineer', 'Sailor', 'Tech Nerd', 'Hobby Drone Pilot'],
      aboutIntro: [
        "I'm {age} years old, a software developer, sailor, tech nerd, gamer, and above all someone who loves trying new things and figuring out how they work. That curiosity is, among other things, exactly why this website exists.",
        "Here I don't just want to tell you a bit about myself — I also want to share my projects, travels, experiences, and interests with you. Maybe you'll even find an idea or two that inspires you."
      ],
      aboutMoreLabel: 'More about me',
      aboutLessLabel: 'Show less',
      aboutSections: [
        {
          heading: 'From hobby to profession and somehow back again',
          image: '/images/about/hobby-zum-beruf.jpg',
          paragraphs: [
            "I've been working as a software developer for {codingYears} years now. But programming isn't just a job for me. In my free time, I also love tinkering with my own projects, trying out new technologies, or making everyday things a little bit smarter.",
            "That's resulted in everything from small software projects to smart home solutions (for my Home Assistant), electronics tinkering, or just things I wanted to try out of pure curiosity.",
            'If that sounds interesting, feel free to check out my [personal projects](/projects). You’ll find both finished projects and things I’m still working on or have simply tried out for testing purposes.'
          ]
        },
        {
          heading: 'At some point, sailing came into the picture …',
          image: '/images/about/segeln.jpg',
          paragraphs: [
            'As you can probably already tell from my profile picture, sailing has become one of my biggest passions alongside technology.',
            'It actually started a bit differently about {sailingYears} years ago, and very small back then: with a motorboat license (in Germany called SBF Binnen/See).',
            "After the first few longer trips, I quickly realized that pure motorboating didn't really fulfill me. Just going from A to B got a bit too monotonous over time, and it's famously not exactly cheap either – even less so now than back then (as of August 2026).",
            'I ended up discovering sailing more or less by chance, through a student sailing trip, and I was immediately hooked by the connection to nature combined with that feeling of freedom.',
            "At the same time, I also knew I didn't want to permanently depend on someone else deciding when and where to sail – and always with strangers along for the ride. Not that I'd mind, even if I can come across as a bit reserved and shy around new people, but sailing with friends is simply more fun. So it was clear to me that I wanted to be out there as a skipper myself one day.",
            'The next logical step was therefore the SKS (Sport Coastal Skipper) license.',
            "I quickly learned, though, that a sailing license isn't comparable to a motorboat or driver's license. Just because you've passed the exam doesn't mean you can safely handle a yacht in every situation.",
            'So more skipper training and additional qualifications followed — including the SRC radio license for VHF marine radio, as well as the corresponding certificate for pyrotechnic distress signals.',
            'Especially the practical training showed me how much there still is to learn about sailing, even after passing the exams.',
            'By now I plan and organize my own sailing trips and try to explore new sailing areas almost every year. I also want to grow with bigger challenges: I’ve already sailed in the Canary Islands, for example, where I had to helm the boat at night in rough weather because the jetty we were moored to had broken.',
            'My biggest role model here is the Australian sailor Jessica Watson. She is regarded as the youngest person to sail solo, non-stop and unassisted around the world. In October 2009, at just 16 years old, she set off from Sydney on her yacht “Ella’s Pink Lady” and returned in May 2010 after 210 days at sea – three days before her 17th birthday.',
            'What impresses me most is that she never gave up. Even before the start, her boat collided with a bulk carrier at night on the delivery trip to the start and lost its mast. Many people called the whole project irresponsible after that – she had the boat repaired and set off anyway. Along the way, storms in the Southern Ocean knocked her boat flat onto its side several times, and she kept going every time. She later told her story in the book “True Spirit”, which was also made into a film in 2023.',
            "If you'd like to follow my trips and sailing adventures, feel free to check out the [travel section](/travel)."
          ]
        },
        {
          heading: 'Why finance eventually became just as interesting to me',
          image: '/images/about/finanzen.jpg',
          paragraphs: [
            "Besides my job and my hobbies — which, alongside sailing, also include skiing and tennis — I've been digging deeper into my own finances and the topic of saving and investing for a few years now.",
            "The reason is actually pretty simple: I don't want to be financially dependent on a single source of income. On top of that, I want my money to work for me and generate passive income that also counters the noticeably higher inflation we've seen since the start of the COVID crisis.",
            "A job that feels secure isn't automatically a guarantee for the future. Illness, an accident, economic shifts, a company going bankrupt, or technological developments like AI can change career paths faster than you might expect. Unfortunately, I've felt that very strongly myself.",
            'My former passion for programming, and in a way for creating things, changed almost overnight. You are no longer in the role of the developer, but rather that of a conductor who sets the direction, leads and oversees everything. But the more I tried to come to terms with it, the more I also saw the potential and the progress in it.',
            "For example, it can also help education — which matters to me, because I've long felt that financial education plays a surprisingly small role in our society.",
            "It wasn't any different for me at first. I learned a lot in school, but almost nothing about how building wealth actually works, what stocks and ETFs even are, how to assess risk, or why it can make sense to deal with your finances as early as possible. That's exactly why I find this topic all the more important.",
            "My own educational path wasn't exactly a straight line either. I started at a Hauptschule (Germany's lower-tier secondary school), worked my way up step by step to a high school diploma, and eventually went to university — ending up with a master's degree. True to the motto: you can achieve anything in life if you have the courage and the drive it takes.",
            'During my studies, I even had the chance to take a PhD position in Brisbane, Australia. As exciting as that opportunity was, I ultimately decided against it. I find research interesting, but I realized I’d rather work hands-on, build things, and actually be able to see what comes out of it in the end.',
            'My time and experiences in Australia also changed how I see Germany, work, and financial security. They reinforced my decision to dig deeper into building wealth and long-term financial planning.',
            "That said, I'm not trying to tell anyone on this website how to invest their money. Instead, I want to show how I go about it myself — the decisions I make, the mistakes I've made, and what I learned from them.",
            'Because I started small too.',
            "And that's exactly why I know getting started can sometimes feel more complicated than it actually has to be. At the same time, you notice over time what a difference it makes to start early and stick with it consistently.",
            'During my studies, I also joined a student investing club. Looking back, that was one of the best ways to really get into the topic. What I valued most was exchanging ideas with others — from fellow students who were just getting started themselves to members with years of experience.',
            "It wasn't just about stocks or investments, either. I met a lot of open, warm people there, with whom I could share a common interest and learn from at the same time.",
            "Especially if you're new to this field and come from a completely different industry, it always helps to build a network. At first, I was the only computer scientist among lots of business students and a few people from other fields of study — and that very mix is what made the exchange so valuable. So I can only recommend talking to others and getting to know different perspectives.",
            "If you're interested in my personal approach to investing, or want to see the trades and decisions I make myself, you'll find more in the [finance section](/finance)."
          ]
        },
        {
          heading: 'And then there’s probably my strongest and longest-running passion …',
          image: '/images/about/gaming.jpg',
          paragraphs: [
            'My probably oldest passion has been with me since I was about seven years old: video games.',
            'It all started with a PlayStation 2, a Game Boy, a Nintendo DS, and eventually a pretty old PC.',
            'What started out as just playing games slowly turned into an interest in the technology behind them. At some point I no longer just wanted to know which game ran on my PC, but why it ran.',
            'How does a processor actually work? What happens in RAM? How does software communicate with hardware? And what happens at the lower levels, all the way down to machine instructions and assembly?',
            'The more I learned about it, the more interested I became in building my own PC.',
            "And that's how a little never-ending story began.",
            'A fairly normal PC with classic air cooling eventually turned into an ever more optimized system. New hardware, better cooling, RGB lighting, cable management, different case concepts — all the way to a PC with a fully custom water-cooling loop, extra gimmicks, and mods I designed myself.',
            'And as is usually the case with hobbies like this, a PC is never really "finished" … For me, that’s been going on for {pcYears} years now…',
            "You can find what I'm currently playing, which hardware I use, and the mods I've built myself in the [gaming section](/setup)."
          ]
        },
        {
          heading: "So that's me",
          image: '/images/about/das-bin-ich.jpg',
          paragraphs: [
            'Software development, sailing, travel, finance, tech, gaming — at first glance, maybe pretty different topics.',
            "But to me, they all have something in common: I love trying things out, I want to understand how they work, and I'm always trying to keep growing.",
            "That's exactly what this website is about.",
            "If any of it is interesting, helpful, or just entertaining for you, then this site has already done its job."
          ]
        }
      ],
      aerialEyebrow: 'Drone Photography',
      aerialTitle: 'The World from a Different Perspective',
      aerialLead:
        "Sometimes all it takes is a change of perspective to discover something completely new...\nEven though I try to stay down to earth and protecting nature matters a lot to me, I love to take off now and then, look beyond the horizon, and realize how beautiful everything actually is.\nWith my DJI Mavic 3, I love capturing beautiful landscapes and moments that often stay hidden from the ground.\n\nBelow you'll find some of my favorite shots around Regensburg and the surrounding area.",
      stats: [
        { icon: 'code', value: '{codingYears}', label: 'Years Coding' },
        { icon: 'sailing', value: '{sailingYears}', label: 'Years Sailing' },
        { icon: 'globe', value: '7', label: 'Countries Visited' },
        { icon: 'idea', value: '∞', label: 'Ideas in My Head' }
      ]
    },
    {
      heroTitle1: 'Willkommen auf meiner',
      heroTitle2: 'Webseite',
      heroSubtitle: 'Schön, dass du meine Webseite besuchst.',
      heroCta: 'Mehr über mich',
      aboutHeading: 'Hi, ich bin Daniel!',
      aboutTags: ['Softwareentwickler', 'Segler', 'Technik-Nerd', 'Hobby-Drohnen-Pilot'],
      aboutIntro: [
        'Ich bin {age} Jahre alt, Softwareentwickler, Segler, Technik-Nerd, Gamer und vor allem jemand, der gerne neue Dinge ausprobiert und verstehen möchte, wie sie funktionieren. Genau diese Neugier hat unter anderem auch dazu geführt, dass diese Webseite entstanden ist.',
        'Hier möchte ich nicht nur ein bisschen über mich erzählen, sondern auch meine Projekte, Reisen, Erfahrungen und Interessen mit dir teilen. Vielleicht findest du dabei ja sogar die eine oder andere Idee, die dich selbst inspiriert.'
      ],
      aboutMoreLabel: 'Mehr über mich',
      aboutLessLabel: 'Weniger anzeigen',
      aboutSections: [
        {
          heading: 'Vom Hobby zum Beruf und irgendwie wieder zurück',
          image: '/images/about/hobby-zum-beruf.jpg',
          paragraphs: [
            'Seit mittlerweile {codingYears} Jahren arbeite ich als Softwareentwickler. Das Programmieren ist für mich allerdings nicht nur ein Beruf. Auch in meiner Freizeit tüftle ich gerne an eigenen Projekten, probiere neue Technologien aus oder versuche, alltägliche Dinge ein kleines bisschen smarter zu machen.',
            'Dabei entstehen mal kleinere Softwareprojekte, mal Smart-Home-Lösungen (für mein Home Assistant), Elektronik-Basteleien oder einfach Dinge, die ich aus Interesse ausprobieren wollte.',
            'Wenn dich das interessiert, kannst du gerne bei meinen [privaten Projekten](/projects) vorbeischauen. Dort findest du sowohl bereits abgeschlossene Projekte als auch Dinge, an denen ich aktuell noch arbeite oder die ich zu Testzwecken einfach mal ausprobiert habe.'
          ]
        },
        {
          heading: 'Irgendwann kam das Segeln dazu …',
          image: '/images/about/segeln.jpg',
          paragraphs: [
            'Wie du wahrscheinlich schon an meinem Profilbild erkennen kannst, gehört neben der Technik inzwischen auch das Segeln zu meinen größten Leidenschaften.',
            'Angefangen hat das Ganze vor ungefähr {sailingYears} Jahren allerdings etwas anders – damals noch ganz klein mit einem Motorbootführerschein (auch SBF Binnen/See genannt).',
            'Nach den ersten längeren Fahrten habe ich relativ schnell festgestellt, dass mich reines Motorbootfahren nicht wirklich erfüllt. Einfach nur von A nach B zu fahren, wurde mir auf Dauer etwas zu eintönig und günstig ist das Ganze bekanntlich auch nicht gerade – heute sogar noch weniger als damals (Stand: August 2026).',
            'Durch einen Studenten-Segeltörn bin ich schließlich eher zufällig beim Segeln gelandet und mich hat die Naturverbundenheit in Verbindung mit einem Freiheitsgefühl sofort begeistert.',
            'Gleichzeitig wusste ich aber auch: Ich möchte nicht dauerhaft darauf angewiesen sein, dass jemand anderes entscheidet, wann und wohin gesegelt wird – und das auch immer mit fremden Leuten. Nicht, dass mir das etwas ausmachen würde, auch wenn ich auf neue Leute anfangs etwas distanziert und schüchtern wirke, aber mit Freunden macht es einfach mehr Spaß. Also stand für mich fest, dass ich irgendwann selbst als Skipper unterwegs sein möchte.',
            'Der nächste logische Schritt war deshalb der Sportküstenschifferschein, kurz SKS.',
            'Dabei habe ich allerdings schnell gelernt, dass ein Segelschein nicht mit einem Motorboot- oder Autoführerschein vergleichbar ist. Nur weil man die Prüfung bestanden hat, bedeutet das noch lange nicht, dass man eine Yacht in jeder Situation sicher beherrscht.',
            'Deshalb folgten weitere Skippertrainings und zusätzliche Qualifikationen – unter anderem der SRC-Funkschein für den UKW-Seefunk sowie der entsprechende Fachkundenachweis für pyrotechnische Seenotsignalmittel.',
            'Vor allem die praktischen Trainings haben mir gezeigt, wie viel es beim Segeln auch nach den Prüfungen noch zu lernen gibt.',
            'Mittlerweile plane und organisiere ich eigene Segeltörns und versuche, fast jedes Jahr neue Reviere kennenzulernen. Außerdem möchte ich an größeren Herausforderungen wachsen: So bin ich zum Beispiel schon auf den Kanaren gesegelt und musste dort bei widrigen Wetterbedingungen nachts das Boot steuern, weil der Steg, an dem wir festgemacht hatten, gebrochen war.',
            'Mein größtes Vorbild ist dabei die australische Seglerin Jessica Watson. Sie gilt als jüngste Person, die allein, nonstop und ohne fremde Hilfe um die Welt gesegelt ist. Im Oktober 2009 startete sie mit gerade einmal 16 Jahren auf ihrer Yacht „Ella’s Pink Lady“ in Sydney und kam im Mai 2010 nach 210 Tagen auf See zurück – drei Tage vor ihrem 17. Geburtstag.',
            'Was mich daran am meisten beeindruckt: Sie hat nie aufgegeben. Schon vor dem Start kollidierte ihr Boot auf der Überführungsfahrt zum Startort nachts mit einem Frachter und verlor dabei den Mast. Viele hielten ihr Vorhaben danach für unverantwortlich – sie ließ das Boot reparieren und segelte trotzdem los. Unterwegs wurde ihr Boot in den Stürmen des Südpolarmeers mehrmals flach aufs Wasser gedrückt und jedes Mal hat sie weitergemacht. Ihre Geschichte hat sie später im Buch „True Spirit“ erzählt, das 2023 auch verfilmt wurde.',
            'Wenn du meine Reisen und Segelabenteuer verfolgen möchtest, schau gerne im [Bereich Reisen](/travel) vorbei.'
          ]
        },
        {
          heading: 'Warum mich Finanzen irgendwann genauso interessiert haben',
          image: '/images/about/finanzen.jpg',
          paragraphs: [
            'Neben meinem Beruf und meinen Hobbys, zu denen neben dem Segeln unter anderem auch Skifahren und Tennis gehören, beschäftige ich mich seit einigen Jahren intensiver mit meinen eigenen Finanzen und dem Thema Geld- bzw. Kapitalanlage.',
            'Der Grund dafür ist eigentlich ziemlich einfach: Ich möchte finanziell nicht ausschließlich von einem einzigen Einkommen abhängig sein. Außerdem soll mein Geld für mich arbeiten und ein passives Einkommen generieren, das zugleich der deutlich gestiegenen Inflation seit Beginn der Corona-Krise entgegenwirkt.',
            'Ein sicher geglaubter Arbeitsplatz ist nicht automatisch eine Garantie für die Zukunft. Krankheit, ein Unfall, wirtschaftliche Veränderungen, die Insolvenz eines Unternehmens oder technologische Entwicklungen wie künstliche Intelligenz können Berufswege schneller verändern, als man vielleicht erwartet. Leider habe ich das auch selbst deutlich zu spüren bekommen.',
            'Meine einstige Leidenschaft, zu programmieren und in gewisser Weise etwas zu erschaffen, hat sich fast von heute auf morgen gewandelt. Man ist nicht mehr in der Rolle des Entwicklers, sondern eher in der des Dirigenten, der alles vorgibt, leitet und überwacht. Doch je mehr ich versucht habe, mich damit anzufreunden, desto mehr habe ich auch das Potenzial und den Fortschritt darin gesehen.',
            'So kann diese Entwicklung zum Beispiel auch die Bildung fördern. Das liegt mir am Herzen, denn ich hatte lange das Gefühl, dass finanzielle Bildung in unserer Gesellschaft eine erstaunlich kleine Rolle spielt.',
            'Mir ging es anfangs selbst nicht anders. In der Schule habe ich viel gelernt, aber kaum etwas darüber, wie Vermögensaufbau funktioniert, was Aktien und ETFs eigentlich sind, wie man Risiken einschätzt oder warum es sinnvoll sein kann, sich möglichst früh mit seinen Finanzen auseinanderzusetzen. Gerade deshalb finde ich dieses Thema umso wichtiger.',
            'Mein eigener Bildungsweg war dabei auch nicht unbedingt geradlinig. Ich habe auf der Hauptschule angefangen, mich anschließend Schritt für Schritt bis zum Abitur weitergearbeitet und schließlich studiert. Am Ende habe ich meinen Masterabschluss gemacht. Ganz nach dem Motto: Man kann im Leben alles erreichen, wenn man den Mut und den nötigen Ehrgeiz dafür aufbringt.',
            'Während meines Studiums ergab sich sogar die Möglichkeit einer Doktorandenstelle in Brisbane (Australien). So spannend diese Chance auch war, habe ich mich letztendlich dagegen entschieden. Forschung finde ich interessant, aber ich habe gemerkt, dass ich lieber praktisch arbeite, Dinge entwickle und am Ende auch sehen kann, was daraus entsteht.',
            'Auch meine Zeit und Erfahrungen in Australien haben meine Sicht auf Deutschland, Arbeit und finanzielle Absicherung verändert. Sie haben mich noch einmal darin bestärkt, mich intensiver mit Vermögensaufbau und langfristiger finanzieller Planung auseinanderzusetzen.',
            'Dabei möchte ich auf dieser Webseite allerdings niemandem erzählen, wie er sein Geld anzulegen hat. Stattdessen möchte ich zeigen, wie ich selbst vorgehe, welche Entscheidungen ich treffe, welche Fehler ich gemacht habe und was ich daraus gelernt habe.',
            'Denn auch ich habe klein angefangen.',
            'Und genau deshalb weiß ich, dass der Einstieg manchmal komplizierter wirkt, als er eigentlich sein muss. Gleichzeitig merkt man mit der Zeit, welchen Unterschied es macht, früh anzufangen und konsequent dranzubleiben.',
            'Während meines Studiums bin ich außerdem einem Börsenverein beigetreten. Rückblickend war das eine der besten Möglichkeiten, um tiefer in das Thema einzusteigen. Besonders wertvoll war für mich der Austausch mit anderen – von Studierenden, die selbst gerade erst angefangen hatten, bis hin zu Mitgliedern mit jahrelanger Erfahrung.',
            'Dabei ging es nicht nur um Aktien oder Investments. Ich habe dort viele offene und herzliche Menschen kennengelernt, mit denen man ein gemeinsames Interesse teilen und gleichzeitig voneinander lernen konnte.',
            'Gerade wenn man neu in diesem Bereich ist und aus einer ganz anderen Branche kommt, ist es immer gut, sich zu vernetzen. Anfangs war ich der einzige Informatiker unter sehr vielen BWL-Studenten und ein paar Leuten aus anderen Studienrichtungen – und gerade diese Mischung hat den Austausch so wertvoll gemacht. Deshalb kann ich nur empfehlen, sich mit anderen auszutauschen und unterschiedliche Sichtweisen kennenzulernen.',
            'Wenn dich meine persönliche Herangehensweise an Investments interessiert oder du sehen möchtest, welche Trades und Entscheidungen ich selbst treffe, findest du mehr dazu im [Bereich Finanzen](/finance).'
          ]
        },
        {
          heading: 'Und dann wäre da noch meine wahrscheinlich stärkste und längste Leidenschaft …',
          image: '/images/about/gaming.jpg',
          paragraphs: [
            'Meine wahrscheinlich älteste Leidenschaft begleitet mich nämlich schon, seit ich ungefähr sieben Jahre alt bin: Videospiele.',
            'Angefangen hat alles mit einer PlayStation 2, einem Game Boy, einem Nintendo DS und irgendwann einem ziemlich alten PC.',
            'Was zunächst einfach nur Spielen war, entwickelte sich mit der Zeit immer mehr zu einem Interesse an der Technik dahinter. Irgendwann wollte ich nicht mehr nur wissen, welches Spiel auf meinem PC läuft, sondern warum es läuft.',
            'Wie arbeitet eigentlich ein Prozessor? Was passiert im Arbeitsspeicher? Wie kommuniziert Software mit der Hardware? Und was passiert auf den unteren Ebenen bis hin zu Maschinenbefehlen und Assembler?',
            'Je mehr ich darüber gelernt habe, desto größer wurde mein Interesse daran, meinen eigenen PC zusammenzustellen.',
            'Und damit begann eine kleine Never-Ending-Story.',
            'Aus einem relativ normalen PC mit klassischer Luftkühlung wurde irgendwann ein immer weiter optimiertes System. Neue Hardware, bessere Kühlung, RGB-Beleuchtung, Kabelmanagement, verschiedene Gehäusekonzepte – bis hin zu einem PC mit kompletter Custom-Wasserkühlung, zusätzlichen Spielereien und selbst entworfenen Modifikationen.',
            'Und wie das bei solchen Hobbys meistens ist, ist ein PC eigentlich nie wirklich „fertig"… Bei mir geht das schon {pcYears} Jahre so…',
            'Was ich aktuell spiele, welche Hardware ich verwende und welche Modifikationen ich selbst gebaut habe, findest du im [Bereich Gaming](/setup).'
          ]
        },
        {
          heading: 'Das bin also ich',
          image: '/images/about/das-bin-ich.jpg',
          paragraphs: [
            'Softwareentwicklung, Segeln, Reisen, Finanzen, Technik, Gaming – auf den ersten Blick vielleicht ziemlich unterschiedliche Themen.',
            'Für mich haben sie aber alle etwas gemeinsam: Ich probiere gerne Dinge aus und möchte verstehen, wie sie funktionieren. Außerdem versuche ich, mich ständig weiterzuentwickeln.',
            'Genau darum geht es auch auf dieser Webseite.',
            'Wenn davon etwas für dich interessant, hilfreich oder einfach unterhaltsam ist, hat die Seite schon ihren Zweck erfüllt.'
          ]
        }
      ],
      aerialEyebrow: 'Drohnen-Fotografie',
      aerialTitle: 'Die Welt aus einer anderen Perspektive',
      aerialLead:
        'Manchmal reicht ein Wechsel der Perspektive, um etwas völlig Neues zu entdecken...\nAuch wenn ich bodenständig und geerdet bleiben möchte und es mir sehr wichtig ist, unsere Natur zu schützen, hebe ich gerne mal ab, blicke über den Horizont hinaus und erkenne dabei, wie schön eigentlich alles ist.\nMit meiner DJI Mavic 3 halte ich dabei gerne schöne Landschaften und Momente fest, die vom Boden aus oft verborgen bleiben.\n\nIm Folgenden findest du einige meiner schönsten Aufnahmen rund um Regensburg und Umgebung.',
      stats: [
        { icon: 'code', value: '{codingYears}', label: 'Jahre Programmieren' },
        { icon: 'sailing', value: '{sailingYears}', label: 'Jahre Segeln' },
        { icon: 'globe', value: '7', label: 'Länder bereist' },
        { icon: 'idea', value: '∞', label: 'Ideen im Kopf' }
      ]
    }
  );

  insertPage(
    db,
    'projects',
    {
      eyebrow: 'Portfolio',
      title: 'My Projects',
      lead: "A mix of finished projects and things I'm still working on — from home automation to trading bots. Here's an overview of what I've built so far and what I'm currently tinkering with.",
      filterAriaLabel: 'Filter projects by status',
      statTotal: 'Total Projects',
      statCompleted: 'Completed',
      statInProgress: 'Active',
      filters: [
        { id: 'all', label: 'All' },
        { id: 'completed', label: 'Completed' },
        { id: 'active', label: 'Active' },
        { id: 'experimental', label: 'Experimental' }
      ],
      statusLabel: { completed: 'Completed', active: 'Active', experimental: 'Experimental' },
      photos: 'photos',
      viewDetails: 'View details',
      close: 'Close',
      previousImage: 'Previous image',
      nextImage: 'Next image'
    },
    {
      eyebrow: 'Portfolio',
      title: 'Meine Projekte',
      lead: 'Eine Mischung aus fertigen Builds und laufenden Projekten — von Hausautomatisierung bis zu Trading-Bots. Hier ein Überblick über das, was ich bereits gebaut habe und woran ich gerade tüftle.',
      filterAriaLabel: 'Projekte nach Status filtern',
      statTotal: 'Projekte gesamt',
      statCompleted: 'Abgeschlossen',
      statInProgress: 'Aktiv',
      filters: [
        { id: 'all', label: 'Alle' },
        { id: 'completed', label: 'Abgeschlossen' },
        { id: 'active', label: 'Aktiv' },
        { id: 'experimental', label: 'Experimentell' }
      ],
      statusLabel: { completed: 'Abgeschlossen', active: 'Aktiv', experimental: 'Experimentell' },
      photos: 'Fotos',
      viewDetails: 'Details ansehen',
      close: 'Schließen',
      previousImage: 'Vorheriges Bild',
      nextImage: 'Nächstes Bild'
    }
  );

  insertPage(
    db,
    'travel',
    {
      heroTitle: 'My Travel Stories',
      heroLead: 'A few impressions from my travels and trips over the past few years.',
      photos: 'photos',
      viewGallery: 'View Gallery'
    },
    {
      heroTitle: 'Meine Travelstories',
      heroLead: 'Ein paar Eindrücke von meinen Reisen und Trips der letzten Jahre.',
      photos: 'Fotos',
      viewGallery: 'Galerie ansehen'
    }
  );

  insertPage(
    db,
    'setup',
    {
      title: 'My Gaming Setup',
      lead: 'Hey gaming fans! I want to show you my gaming PC, built for long gaming sessions.',
      highEndTitle: 'High-End Build',
      highEndDesc: 'My main PC — full custom water cooling, built for performance and a nice RGB look.',
      waterCoolingTitle: 'My Water Cooling Setup',
      waterCoolingIntro: "Here's why I decided to add water cooling to my PC, and why I think it's worth it.",
      bullets: [
        { title: 'Temperature Control:', text: 'Water cools a lot better than air.' },
        { title: 'Overclocking Potential:', text: 'Lower temperatures mean you can push the hardware further.' },
        { title: 'Silent Operation:', text: 'The PC runs a lot quieter.' },
        { title: 'Component Protection:', text: 'Better temperatures can help your hardware last longer.' }
      ],
      tipsTitle: 'A few tips',
      tipsText:
        "Before you build your own water cooling loop, here are a few tips. Water cooling works great, but it also has risks — leaks, corrosion, and it needs some maintenance. If you plan it well and test for leaks first, it can look great and still be reliable. I replace all of the coolant once a year. Every two years I renew the thermal paste and clean the dust out of the PC.",
      explore3dTitle: 'Explore the build in 3D',
      explore3dText: 'A simple 3D model of the loop. Drag to rotate it, scroll to zoom, and hover or click on a part to see what it is.',
      umbauTitle: 'Current gaming PC',
      umbauDesc: 'A quick look at the finished PC with all its modifications, just as it looks today.',
      printTitle: 'Neon',
      printText: 'I 3D printed the Neon figure inside the case myself and painted it by hand. On the left is the raw print, on the right the finished Neon.',
      printAlt: 'The Neon figure as a white 3D print and finished painted in blue',
      spikeTitle: 'Spike',
      spikeText: 'I built the Valorant Spike myself. I 3D printed the housing and fitted two LEDs at the top and bottom, which talk to the PC through an ESP32 over USB. The Spike plays the same sounds and animations as the real Spike in Valorant. It also has a defuse function.',
      setupPhotoAlt: 'My desk with the 49-inch Samsung monitor and the water-cooled PC next to it',
      setupPhotoCaption: 'My gaming setup with my custom PC on the right.',
      componentsPhotoTitle: 'Everything that went into this build',
      componentsPhotoCaption: 'Every box, before I put in a single screw.',
      componentsPhotoAlt: 'All the parts for the high-end PC build, unboxed and laid out',
      secondBuildTitle: 'Second Build',
      secondBuildDesc: 'A second PC I built: an NZXT H510i with RGB, a Ryzen 5 5600G with integrated graphics and a 240 mm AIO water cooler.',
      serverTitle: 'Third Build: Server',
      serverDesc: 'My old gaming PC, which I used before my current gaming PC and which now only serves as a server/workstation.',
      serverPhotoAlt: 'My old gaming PC, now rebuilt as a server',
      hardwareTitle: 'Hardware',
      hardwareDisclaimer: ''
    },
    {
      title: 'Mein Gaming-Setup',
      lead: 'Hey Gaming-Fans! Ich freue mich, euch meinen ultimativen Gaming-PC für grenzenlose Gaming-Abenteuer vorzustellen.',
      highEndTitle: 'High-End Build',
      highEndDesc: 'Mein Hauptrechner — komplett individuelle Wasserkühlung, gebaut für Performance und RGB-Show.',
      waterCoolingTitle: 'Wasserkühlung meistern: Eine individuelle Reise',
      waterCoolingIntro: 'Ich möchte kurz auf die Vorteile von Wasserkühlung eingehen und erklären, warum ich mich entschieden habe, meinen Computer mit einer Wasserkühlung auszustatten.',
      bullets: [
        { title: 'Temperaturkontrolle:', text: 'Wasserkühlung leitet Wärme deutlich effizienter ab als Luft.' },
        { title: 'Overclocking-Potenzial:', text: 'Niedrigere Temperaturen ermöglichen aggressiveres Tuning.' },
        { title: 'Leiser Betrieb:', text: 'Die Systemlautstärke wird deutlich reduziert.' },
        { title: 'Komponentenschutz:', text: 'Bessere thermische Stabilität kann die Lebensdauer der Hardware verlängern.' }
      ],
      tipsTitle: 'Ein paar wichtige Dinge...',
      tipsText:
        'Bevor du selbst mit einer Wasserkühlung anfängst, möchte ich dir ein paar Tipps mit auf den Weg geben. Wasserkühlung senkt die Temperatur effizient, bringt aber auch Risiken wie Lecks, Korrosion und Wartungsaufwand mit sich. Mit sorgfältiger Planung und Drucktests kann das System sowohl schön als auch zuverlässig sein. Ich tausche die Kühlflüssigkeit einmal im Jahr komplett aus. Alle zwei Jahre erneuere ich die Wärmeleitpaste und befreie den PC von Staub.',
      explore3dTitle: 'Den Build in 3D erkunden',
      explore3dText: 'Eine stilisierte 3D-Darstellung des Wasserkreislaufs — ziehen zum Drehen, scrollen zum Zoomen und über ein Teil hovern oder klicken, um mehr zu erfahren.',
      umbauTitle: 'Aktueller Gaming PC',
      umbauDesc: 'Ein kurzer Einblick des fertigen PCs mit allen Modifikationen so wie er jetzt aussieht.',
      printTitle: 'Neon',
      printText: 'Die Neon-Figur im Gehäuse habe ich selbst mit dem 3D-Drucker gedruckt und von Hand bemalt. Links siehst du den rohen Druck, rechts die fertige Neon.',
      printAlt: 'Die Neon-Figur als weißer 3D-Druck und fertig bemalt in Blau',
      spikeTitle: 'Spike',
      spikeText: 'Den Valorant Spike habe ich selbst gebaut. Das Gehäuse habe ich mit dem 3D-Drucker gedruckt und zwei LEDs oben und unten eingebaut, welche über einen ESP32 über die USB-Schnittstelle mit dem PC kommunizieren. Der Spike hat dabei den gleichen Sound und Animationen wie der echte Spike in Valorant. Auch hat er eine Defuse Funktion.',
      setupPhotoAlt: 'Mein Schreibtisch mit dem 49-Zoll-Monitor von Samsung und dem wassergekühlten PC daneben',
      setupPhotoCaption: 'Mein Gaming Setup mit meinem Custom PC rechts.',
      componentsPhotoTitle: 'Alles, was in diesen Build geflossen ist',
      componentsPhotoCaption: 'Jede Box, bevor auch nur eine Schraube verbaut wurde.',
      componentsPhotoAlt: 'Alle Teile für den High-End-PC-Build, ausgepackt und aufgereiht',
      secondBuildTitle: 'Zweiter Build',
      secondBuildDesc: 'Ein zweiter PC, den ich zusammengebaut habe: ein NZXT H510i mit RGB, ein Ryzen 5 5600G mit integrierter Grafik und eine 240-mm-AIO-Wasserkühlung.',
      serverTitle: 'Dritter Build: Server',
      serverDesc: 'Mein alter Gaming-PC, den ich vor meinem jetzigen Gaming-PC verwendet habe und nur noch als Server/Workstation dient.',
      serverPhotoAlt: 'Mein alter Gaming-PC, jetzt als Server umgebaut',
      hardwareTitle: 'Hardware',
      hardwareDisclaimer: ''
    }
  );

  insertPage(
    db,
    'finance',
    {
      eyebrow: 'Finance & Investing',
      title: 'My Investment Journey',
      lead: "I've been actively trading since 2021 — my focus is on short-term crypto trading and hand-picked individual stocks rather than broad ETFs. I watch charts, price action and news daily and make my calls based on technical analysis. In 2022 I also earned my stock exchange licence (Börsenführerschein), which covers the fundamentals of exchange trading, order types and an understanding of risk.",
      tags: ['Stock Exchange Licence', 'Crypto', 'Day-Trading', 'Individual Stocks', 'Chart Analysis', 'Risk Management'],
      stats: [
        { label: 'Since', value: '2021' },
        { label: 'Focus', value: 'Individual Stocks' },
        { label: 'Approach', value: 'Crypto Day-Trader' },
        { label: 'Style', value: 'Technical' }
      ],
      strategyTitle: 'What guides my strategy',
      focusAreas: [
        'Active day-trading in the crypto market',
        'Targeted positions in hand-picked individual stocks',
        'Technical chart analysis over gut feeling',
        'Watching price action and news daily'
      ],
      credential: {
        label: 'Certified · 2022',
        title: 'Stock Exchange Licence',
        text: 'Börsenführerschein: how exchanges work, order types, securities and risk management.'
      },
      rulesTitle: 'My trading rules',
      rulesLead: 'What I consider before every trade:',
      rules: [
        { title: 'Max. 10 % risk per trade', text: 'I never risk more than 10 % of my trading capital on a single trade. That keeps a possible loss manageable.' },
        { title: 'No trade without a stop-loss', text: 'The stop should be set before the trade, so you can judge when to get out.' },
        { title: 'Reward at least 2:1', text: 'If the distance to the target is not at least twice the distance to the stop, I skip the trade.' },
        { title: 'Trade with the trend', text: 'I would rather buy when the price is already rising than guess when a falling price will turn around. For me, that is usually a sign that the turning point has come.' },
        { title: 'No overvalued stocks', text: 'Before buying I check the P/E ratio and compare it with the sector and the stock\'s own history. If it is far above both, I wait.' },
        { title: 'Max. 20 % per stock', text: 'No single stock grows beyond a fifth of my stock portfolio, however convinced I am.' }
      ],
      watchlistTitle: 'Watchlist',
      watchlistLead: 'What I am keeping an eye on right now. Change vs. previous close.',
      journalTitle: 'My latest trades',
      journalLead: 'Entry, idea and result in %. No euro amounts.',
      journalColumns: { date: 'Date', asset: 'Asset', side: 'Side', idea: 'Idea', result: 'Result', open: 'open' },
      trades: [],
      lessonsTitle: 'Lessons learned',
      lessons: [
        { title: 'Fewer, better trades', text: 'A handful of well-prepared trades beats a dozen spontaneous ones.' },
        { title: 'Conviction means buying more, not panicking', text: 'If I am convinced of a stock long term and nothing has changed in my analysis, I would rather buy more on a dip than sell in a hurry. Short-term trades still follow the stop-loss.' }
      ],
      booksTitle: 'Reading list',
      booksLead: 'Books on trading and markets I can recommend.',
      books: [
        { title: 'Trading in the Zone', image: '/images/finance/books/trading-in-the-zone.jpg', author: 'Mark Douglas', text: 'Trading psychology: discipline, probabilities and why the mindset decides more than the setup.' },
        { title: 'Technical Analysis of the Financial Markets', image: '/images/finance/books/technical-analysis.jpg', author: 'John J. Murphy', text: 'The standard reference for chart analysis, from trends and patterns to indicators.' },
        { title: 'Reminiscences of a Stock Operator', image: '/images/finance/books/reminiscences.jpg', author: 'Edwin Lefèvre', text: 'The classic about speculator Jesse Livermore. Over 100 years old and still spot on.' },
        { title: 'The Psychology of Money', image: '/images/finance/books/psychologie-des-geldes.jpg', author: 'Morgan Housel', text: 'Short stories on how people really behave with money, and why that matters more than any formula.' },
        { title: 'Market Wizards', image: '/images/finance/books/market-wizards.jpg', author: 'Jack D. Schwager', text: 'Interviews with top traders. Very different styles, the same discipline.' },
        { title: 'Aktien für Dummies', image: '/images/finance/books/aktien-fuer-dummies.jpg', author: 'Christine Bortenlänger, Ulrich Kirstein', text: 'The easy German introduction: how stocks work, building your own strategy and the basics of order types and investor protection.' }
      ],
      platformsTitle: 'Where I invest & connect',
      platformsLead: "The platforms I trade on and the community I'm part of.",
      resourcesTitle: 'Resources I use',
      resourcesLead: 'Where I get my market data, news and background knowledge from.',
      resourcesFocusLabel: 'Focus'
    },
    {
      eyebrow: 'Finanzen & Investieren',
      title: 'Meine Investment-Reise',
      lead: 'Ich handle seit 2021 aktiv — mein Fokus liegt auf kurzfristigem Krypto-Trading und ausgewählten Einzelaktien statt breit gestreuten ETFs. Ich beobachte Charts, Kursbewegungen und Nachrichtenlage täglich und treffe meine Entscheidungen technisch fundiert. Zudem habe ich 2022 den Börsenführerschein abgelegt, der die Grundlagen zu Börsenhandel, Ordertypen und ein Verständnis zum Risiko gibt.',
      tags: ['Börsenführerschein', 'Krypto', 'Day-Trading', 'Einzelaktien', 'Chartanalyse', 'Risikomanagement'],
      stats: [
        { label: 'Seit', value: '2021' },
        { label: 'Fokus', value: 'Einzelaktien' },
        { label: 'Ansatz', value: 'Krypto Day-Trader' },
        { label: 'Stil', value: 'Technisch' }
      ],
      strategyTitle: 'Was meine Strategie leitet',
      focusAreas: [
        'Aktives Day-Trading im Kryptomarkt',
        'Gezielte Positionen in ausgewählten Einzelaktien',
        'Technische Chartanalyse statt Bauchgefühl',
        'Tägliches Beobachten von Kursbewegungen und News'
      ],
      credential: {
        label: 'Zertifiziert · 2022',
        title: 'Börsenführerschein',
        text: 'Wie Börsen funktionieren, Ordertypen, Wertpapierarten und Risikomanagement.'
      },
      rulesTitle: 'Meine Trading-Regeln',
      rulesLead: 'Was ich vor jedem Trade berücksichtige:',
      rules: [
        { title: 'Max. 10 % Risiko pro Trade', text: 'Pro Trade riskiere ich nie mehr als 10 % meines Trading-Kapitals. So bleibt ein mögliches Verlustrisiko überschaubar.' },
        { title: 'Kein Trade ohne Stop-Loss', text: 'Der Stop sollte vor dem Trade festgelegt werden, um abschätzen zu können, wann man rausgeht.' },
        { title: 'Chance-Risiko mindestens 2:1', text: 'Ist der Weg zum Ziel nicht mindestens doppelt so weit wie zum Stop, lasse ich den Trade aus.' },
        { title: 'Mit dem Trend handeln', text: 'Ich kaufe lieber, wenn der Kurs schon steigt, als zu raten, wann ein fallender Kurs wieder dreht. Meist ist dies ein Indiz für mich, dass dies der Wendepunkt ist.' },
        { title: 'Keine überbewerteten Aktien', text: 'Vor dem Kauf schaue ich aufs KGV (Kurs-Gewinn-Verhältnis) und vergleiche es mit der Branche und der eigenen Historie der Aktie. Liegt es weit darüber, warte ich.' },
        { title: 'Max. 20 % pro Aktie', text: 'Keine Einzelaktie wird größer als ein Fünftel meines Aktiendepots, egal wie überzeugt ich bin.' }
      ],
      watchlistTitle: 'Watchlist',
      watchlistLead: 'Was ich gerade im Blick habe. Veränderung zum letzten Schlusskurs.',
      journalTitle: 'Meine letzten Trades',
      journalLead: 'Einstieg, Idee und Ergebnis in %. Keine Euro-Beträge.',
      journalColumns: { date: 'Datum', asset: 'Asset', side: 'Richtung', idea: 'Idee', result: 'Ergebnis', open: 'offen' },
      trades: [],
      lessonsTitle: 'Lessons Learned',
      lessons: [
        { title: 'Weniger, dafür bessere Trades', text: 'Eine Handvoll gut vorbereiteter Trades schlägt ein Dutzend spontane.' },
        { title: 'Überzeugung heißt nachkaufen, nicht panisch verkaufen', text: 'Wenn ich von einer Aktie langfristig überzeugt bin und sich an meiner Analyse nichts geändert hat, kaufe ich bei Verlusten lieber nach, als voreilig auszusteigen. Für kurzfristige Trades gilt weiter der Stop-Loss.' }
      ],
      booksTitle: 'Leseliste',
      booksLead: 'Bücher rund um Trading und Märkte, die ich empfehlen kann.',
      books: [
        { title: 'Trading in the Zone', image: '/images/finance/books/trading-in-the-zone.jpg', author: 'Mark Douglas', text: 'Trading-Psychologie: Disziplin, Wahrscheinlichkeiten und warum die Einstellung mehr entscheidet als das Setup.' },
        { title: 'Technical Analysis of the Financial Markets', image: '/images/finance/books/technical-analysis.jpg', author: 'John J. Murphy', text: 'Das Standardwerk zur Chartanalyse, von Trends und Formationen bis zu Indikatoren.' },
        { title: 'Reminiscences of a Stock Operator', image: '/images/finance/books/reminiscences.jpg', author: 'Edwin Lefèvre', text: 'Der Klassiker über den Spekulanten Jesse Livermore. Über 100 Jahre alt und immer noch treffend.' },
        { title: 'Über die Psychologie des Geldes', image: '/images/finance/books/psychologie-des-geldes.jpg', author: 'Morgan Housel', text: 'Kurze Geschichten darüber, wie Menschen wirklich mit Geld umgehen, und warum das wichtiger ist als jede Formel.' },
        { title: 'Market Wizards', image: '/images/finance/books/market-wizards.jpg', author: 'Jack D. Schwager', text: 'Interviews mit Top-Tradern. Ganz unterschiedliche Stile, dieselbe Disziplin.' },
        { title: 'Aktien für Dummies', image: '/images/finance/books/aktien-fuer-dummies.jpg', author: 'Christine Bortenlänger, Ulrich Kirstein', text: 'Der leichte Einstieg: wie Aktien funktionieren, wie man eine eigene Strategie entwickelt und was man über Ordertypen und Anlegerschutz wissen sollte.' }
      ],
      platformsTitle: 'Wo ich investiere & mich vernetze',
      platformsLead: 'Meine Handelsplattformen und die Community, deren Teil ich bin.',
      resourcesTitle: 'Ressourcen, die ich nutze',
      resourcesLead: 'Woher ich meine Marktdaten, News und mein Hintergrundwissen beziehe.',
      resourcesFocusLabel: 'Fokus'
    }
  );

  insertPage(
    db,
    'contact',
    {
      eyebrow: 'Contact',
      title: "Let's Connect",
      lead: "Got a question, a project idea, or just want to say hi? Drop me a message and I'll get back to you as soon as I can.",
      sendMessage: 'Send a Message',
      successMessage: "Thanks for reaching out! Your message is on its way and I'll get back to you soon.",
      emailLabel: 'Email address',
      emailPlaceholder: 'you@example.com',
      emailErrorPrefix: 'Email',
      messageLabel: 'Message',
      messagePlaceholder: "Tell me what's on your mind...",
      messageErrorPrefix: 'Message',
      sending: 'Sending...',
      send: 'Send Message',
      professionalTitle: 'Computer Scientist M.Sc. | Software Engineer'
    },
    {
      eyebrow: 'Kontakt',
      title: 'Lass uns in Kontakt treten',
      lead: 'Hast du eine Frage, eine Projektidee oder möchtest einfach Hallo sagen? Schreib mir eine Nachricht — ich melde mich so schnell wie möglich zurück.',
      sendMessage: 'Nachricht senden',
      successMessage: 'Danke für deine Nachricht! Sie ist auf dem Weg und ich melde mich bald bei dir zurück.',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'du@beispiel.de',
      emailErrorPrefix: 'E-Mail',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Was möchtest du mir mitteilen...',
      messageErrorPrefix: 'Nachricht',
      sending: 'Wird gesendet...',
      send: 'Nachricht senden',
      professionalTitle: 'Informatiker M.Sc. | Software Engineer'
    }
  );

  insertPage(
    db,
    'resume',
    {
      eyebrow: 'Background',
      title: 'A Quick Look at My Path',
      lead: "From radar software to cloud tools — here's a short overview of where I've worked, what I studied, and what I've learned along the way.",
      experienceTitle: 'Experience',
      educationTitle: 'Education',
      skillsTitle: 'Skills & Tools',
      certificatesTitle: 'Certificates'
    },
    {
      eyebrow: 'Werdegang',
      title: 'Ein kurzer Überblick über meinen Weg',
      lead: 'Von eingebetteter Radar-Software bis zu Cloud-Tooling — hier ein kompakter Überblick über meine Stationen, mein Studium und was ich dabei mitgenommen habe.',
      experienceTitle: 'Berufserfahrung',
      educationTitle: 'Ausbildung',
      skillsTitle: 'Skills & Tools',
      certificatesTitle: 'Zertifikate'
    }
  );
}

function seedHome(db: DatabaseSync) {
  const shots = [
    {
      image: '/images/projects/dji-photo-1.jpg',
      location: 'Regensburg',
      year: 2022,
      title_en: 'Regensburg Nord',
      title_de: 'Regensburg Nord',
      description_en:
        "This photo was taken in 2022 on the Winzerer Höhen in the north of Regensburg. From up here, the view opens out over the city's northern outskirts toward Adlersberg and Tremmelhauserhöhe.\n\nBetween fields, meadows, and small villages, plenty of farmland and farmsteads still shape this area today. That contrast with the city center, just a few kilometers away, shows a different side of Regensburg: quiet, spacious, and surprisingly close to nature.",
      description_de:
        'Dieses Foto entstand 2022 auf den Winzerer Höhen im Norden Regensburgs. Von hier aus öffnet sich der Blick über die nördlichen Ausläufer der Stadt in Richtung Adlersberg und Tremmelhauserhöhe.\n\nZwischen Feldern, Wiesen und kleinen Ortschaften liegen noch heute zahlreiche landwirtschaftlich geprägte Flächen und Höfe. Gerade dieser Kontrast zur nur wenige Kilometer entfernten Innenstadt zeigt eine andere Seite Regensburgs: ruhig, weitläufig und überraschend naturverbunden.'
    },
    {
      image: '/images/projects/dji-photo-2.jpg',
      location: 'Lupburg',
      year: 2022,
      title_en: 'Lupburg',
      title_de: 'Lupburg',
      description_en:
        "Lupburg is a small market town in the Upper Palatinate Jura, not far from Parsberg. With around 2,500 residents, it's surrounded by a wide landscape of forests, meadows, and fields.\n\nWhat I love about this photo is how closely the village and nature are woven together here. At the same time, the tall wind turbines on the horizon shape the modern landscape and stand as a symbol of the shift toward renewable energy.\n\nFor me, Lupburg is one of the most beautiful and lovable places in this area — quiet, rural, and with exactly the charm I associate with the Upper Palatinate.",
      description_de:
        'Lupburg ist eine kleine Marktgemeinde im Oberpfälzer Jura, unweit von Parsberg. Mit seinen rund 2.500 Einwohnern ist der Ort von einer weitläufigen Landschaft aus Wäldern, Wiesen und Feldern umgeben.\n\nDas Foto zeigt für mich besonders schön, wie eng Dorf und Natur hier miteinander verbunden sind. Gleichzeitig prägen die hoch aufragenden Windräder am Horizont das moderne Landschaftsbild und stehen sinnbildlich für den Wandel hin zu erneuerbaren Energien.\n\nLupburg gehört für mich zu den schönsten und liebenswertesten Orten in dieser Gegend – ruhig, ländlich und mit genau dem Charme, den ich mit der Oberpfalz verbinde.'
    },
    {
      image: '/images/projects/dji-photo-3.jpg',
      location: 'Regensburg',
      year: 2024,
      title_en: 'Regensburg Süd',
      title_de: 'Regensburg Süd',
      description_en:
        "Looking south over Regensburg, it becomes clear how much the city has grown and developed over the past few decades.\n\nIn the background lies Burgweinting-Harting, among other areas — today one of Regensburg's larger districts. Where fields and small settlements once shaped the landscape, residential areas, commercial zones, and transport infrastructure now meet the still-expansive countryside surrounding the city.\n\nFrom the air, this transition between city and nature becomes especially clear.",
      description_de:
        'Richtet man den Blick in den Süden Regensburgs, wird deutlich, wie stark sich die Stadt über die vergangenen Jahrzehnte entwickelt und ausgedehnt hat.\n\nIm Hintergrund erstreckt sich unter anderem Burgweinting-Harting, heute einer der größeren Stadtbezirke Regensburgs. Wo früher vor allem Felder und kleinere Siedlungen das Landschaftsbild bestimmten, treffen heute Wohngebiete, Gewerbeflächen und Verkehrsinfrastruktur unmittelbar auf die noch immer weitläufige Landschaft rund um die Stadt.\n\nGerade aus der Luft wird dieser Übergang zwischen Stadt und Natur besonders deutlich.'
    },
    {
      image: '/images/projects/dji-photo-4.jpg',
      location: 'Parsberg',
      year: 2024,
      title_en: 'Parsberg',
      title_de: 'Parsberg',
      description_en:
        "Parsberg sits nestled in the hilly landscape of the Upper Palatinate Jura, blending history, nature, and the life of a modern small town in a special way — a town I feel closely connected to.\n\nParsberg Castle shapes the townscape from far away, even though it's a bit hard to make out in the photo — it sits on the hill in the right background. The Christmas market there is especially lovely, and I visit it every year.\n\nFrom the air, it's also especially clear how compactly Parsberg sits within the landscape — a small town surrounded by plenty of nature and the countryside typical of the Upper Palatinate.\n\nBut you can also see how it keeps growing. On the left you can spot the Möbelhof furniture store and the new Edeka supermarket, with the new housing developments right across from them.",
      description_de:
        'Parsberg liegt eingebettet in die hügelige Landschaft des Oberpfälzer Jura und vereint auf besondere Weise Geschichte, Natur und das Leben einer modernen Kleinstadt, mit der ich mich auch eng verbunden fühle.\n\nSchon von Weitem prägt die Burg Parsberg das Stadtbild, auch wenn sie auf dem Foto her etwas schwer zu erkennen ist, liegt sie auf dem Hügel rechts im Hintergrund. Besonders schön ist dort der Weihnachtsmarkt, den ich jährlich besuche.\n\nAus der Luft zeigt sich zudem besonders schön, wie kompakt Parsberg in die Landschaft eingebettet ist – eine kleine Stadt, umgeben von viel Natur und typisch oberpfälzischer Landschaft.\n\nAber auch wie sie zunehmend wächst. So ist links der Möbelhof und der neue Edeka zu sehen und die Neubausiedlungen direkt Gegenüber.'
    },
    {
      image: '/images/projects/dji-photo-5.jpg',
      location: 'Regensburg',
      year: 2021,
      title_en: 'Winter 2021',
      title_de: 'Winter 2021',
      description_en:
        'During a brief but intense cold snap in 2021, I wanted to capture this particular moment. This recording was taken on a walk through the snow-covered forest near Steinweg.\n\nFor a short while, the snow turned a familiar path into an almost perfectly still winter landscape. The snow-laden trees, the narrow trail, and the muted atmosphere made this moment feel special to me.\n\nPrecisely because days with snow like this aren’t a given in Regensburg, I wanted to hold onto this moment.',
      description_de:
        'Während eines kurzen, aber kräftigen Wintereinbruchs im Jahr 2021 wollte ich diesen besonderen Moment festhalten. Bei einem Spaziergang durch den verschneiten Wald bei Steinweg entstand diese Aufnahme.\n\nFür kurze Zeit verwandelte der Schnee den vertrauten Weg in eine beinahe vollkommen ruhige Winterlandschaft. Die schneebedeckten Bäume, der schmale Weg und die gedämpfte Atmosphäre machten diesen Augenblick für mich zu etwas Besonderem.\n\nGerade weil solche ausgeprägten Wintertage in Regensburg nicht selbstverständlich sind, wollte ich diesen Moment in Erinnerung behalten.'
    },
    {
      image: '/images/projects/dji-photo-6.jpg',
      location: 'Regensburg',
      year: 2025,
      title_en: 'Winter Dusk over the Danube',
      title_de: 'Winterliche Dämmerung über der Donau',
      description_en:
        'Especially during the cold winter months, the landscape around Regensburg shows a completely different side of itself. When the surrounding fields are covered in snow and the sun slowly sets in the west, a very particular light settles over the Danube and its surroundings.\n\nThe last warm colors of the day meet the cool blues and whites of the winter landscape. For a brief moment, a mood emerges in which the otherwise lively surroundings feel almost completely still.',
      description_de:
        'Besonders in den kalten Wintermonaten zeigt sich die Landschaft rund um Regensburg von einer ganz anderen Seite. Wenn die umliegenden Felder von Schnee bedeckt sind und die Sonne im Westen langsam untergeht, legt sich ein ganz besonderes Licht über die Donau und ihre Umgebung.\n\nDie letzten warmen Farben des Tages treffen dabei auf die kühlen Blau- und Weißtöne der Winterlandschaft. Für einen kurzen Moment entsteht eine Stimmung, in der die sonst so lebendige Umgebung beinahe vollkommen ruhig wirkt.'
    },
    {
      image: '/images/projects/dji-photo-7.jpg',
      location: 'Regensburg',
      year: 2023,
      title_en: 'The Golden Hour over the Land',
      title_de: 'Die goldenen Stunden über dem Land',
      description_en:
        'What I enjoy most is watching a sunrise or sunset.\n\nSeeing how the light slowly changes and bathes the landscape in warm gold, orange, and red tones for just a few minutes.\n\nI wanted to capture this sunset from the air, because what I find especially striking here is how the last warm rays of sunlight break through gaps in the cloud cover, casting cones of light onto the fields below.',
      description_de:
        'Am schönsten finde ich es einen Sonnenauf- oder Sonnenuntergang zu beobachten.\n\nZu sehen, wie sich das Licht langsam verändert und die Landschaft für wenige Minuten in warme Gold-, Orange- und Rottöne taucht.\n\nDiesen Sonnenuntergang wollte ich dabei aus der Luft festhalten, da ich hier besonders beeindruckend finde, wie die letzten warmen Sonnenstrahlen durch einzelne Öffnungen in der Wolkendecke brechen und wie Lichtkegel auf die darunterliegenden Felder fallen.'
    },
    {
      image: '/images/projects/dji-photo-8.jpg',
      location: 'Regensburg',
      year: 2025,
      title_en: 'Regensburg Dult',
      title_de: 'Regensburg Dult',
      description_en:
        "Twice a year, the Regensburg Dult is one of the highlights of city life. With centuries of tradition behind it, it's far more than just a fun fair, and it's deeply tied to Regensburg and Stadtamhof.\n\nIts history goes back to the Middle Ages. Over the centuries, the markets and festivities were held in different parts of the city before the Dult finally found its current home at Dultplatz in Stadtamhof.\n\nOne of its most visible landmarks is the Ferris wheel. From its gondolas, you get an extraordinary view over the rooftops of Stadtamhof, the Danube, and Regensburg's historic old town with its many towers.\n\nFrom the air, it's especially striking to see how this colorful fun fair sits right next to the old town that grew over centuries — a mix of tradition, history, and modern city life.",
      description_de:
        'Zweimal im Jahr gehört die Regensburger Dult zu den Höhepunkten des Stadtlebens. Mit ihrer jahrhundertelangen Tradition ist sie weit mehr als nur ein Volksfest und inzwischen fest mit Regensburg und Stadtamhof verbunden.\n\nIhre Geschichte reicht bis ins Mittelalter zurück. Über die Jahrhunderte fanden die Märkte und Feste an unterschiedlichen Orten der Stadt statt, bevor die Dult schließlich ihren heutigen Platz am Dultplatz in Stadtamhof fand.\n\nEines ihrer weithin sichtbaren Wahrzeichen ist das Riesenrad. Von seinen Gondeln eröffnet sich ein außergewöhnlicher Blick über die Dächer von Stadtamhof, die Donau und die historische Regensburger Altstadt mit ihren zahlreichen Türmen.\n\nGerade aus der Luft zeigt sich besonders schön, wie das farbenfrohe Volksfest unmittelbar neben der über Jahrhunderte gewachsenen Altstadt liegt – ein Zusammenspiel aus Tradition, Geschichte und modernem Stadtleben.'
    }
  ];

  const insertShot = db.prepare(
    'INSERT INTO home_aerial_shots (sort_order, image, hover_video, location, year, title_en, title_de, description_en, description_de) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  shots.forEach((s: typeof shots[number] & { hoverVideo?: string }, i) =>
    insertShot.run(i, s.image, s.hoverVideo ?? null, s.location, s.year ?? null, s.title_en, s.title_de, s.description_en, s.description_de)
  );

  const videos = [
    {
      src: `${MEDIA_BASE_URL}/videos/sunset-intro.mp4`,
      location: 'Lupburg',
      year: 2022,
      title_en: 'Lupburg 360° at sunset',
      title_de: 'Lupburg 360° bei Sonnenuntergang',
      description_en:
        'Sometimes it’s worth changing perspective. This 360° shot was taken during a sunset over Lupburg and shows the vastness of the Upper Palatinate landscape from a very special angle.\n\nAs the sun slowly disappears behind the horizon, it bathes fields, forests, and the small surrounding villages in a warm, golden light. From the air, the landscape seems almost endless — and especially in the last few minutes of the day, a very particular kind of stillness sets in.\n\nFor me, it’s one of those moments where you simply pause for a second and take in the view.',
      description_de:
        'Manchmal lohnt es sich, die Perspektive zu wechseln. Diese 360°-Aufnahme entstand während eines Sonnenuntergangs über Lupburg und zeigt die Weite der oberpfälzischen Landschaft aus einer ganz besonderen Perspektive.\n\nWährend die Sonne langsam hinter dem Horizont verschwindet, taucht sie Felder, Wälder und die kleinen umliegenden Ortschaften in ein warmes, goldenes Licht. Aus der Luft scheint die Landschaft dabei beinahe endlos – und gerade in den letzten Minuten des Tages entsteht eine ganz besondere Ruhe.\n\nFür mich ist es einer dieser Momente, in denen man einfach kurz innehält und die Aussicht genießt.'
    },
    {
      src: `${MEDIA_BASE_URL}/videos/winter-intro.mp4`,
      location: 'Regensburg',
      year: 2023,
      title_en: 'Winter over Regensburg',
      title_de: 'Winter über Regensburg',
      description_en:
        'When snow covers the rooftops, fields, and streets overnight, Regensburg shows a completely different side of itself. The city, usually so familiar, suddenly feels quieter and almost transformed.\n\nFrom the air especially, you can see how the white winter landscape stretches from the densely built parts of the city all the way out into the surrounding fields and forests.\n\nDays like this aren’t all that common in Regensburg — and maybe that’s exactly why these brief winter moments give the city such a special atmosphere for a while, one I wanted to capture and hold on to.',
      description_de:
        'Wenn Schnee über Nacht die Dächer, Felder und Straßen bedeckt, zeigt sich Regensburg von einer ganz anderen Seite. Die sonst so vertraute Stadt wirkt plötzlich ruhiger und beinahe wie verwandelt.\n\nBesonders aus der Luft wird sichtbar, wie sich die weiße Winterlandschaft von den dicht bebauten Teilen der Stadt bis weit hinaus in die umliegenden Felder und Wälder zieht.\n\nSolche Tage sind in Regensburg nicht allzu häufig – und vielleicht sind es gerade deshalb diese kurzen Wintermomente, die die Stadt für eine Weile in einer ganz besonderen Atmosphäre erscheinen lassen und ich für die Vergangenheit festhalten möchte.'
    },
    {
      src: `${MEDIA_BASE_URL}/videos/silvester-intro.mp4`,
      location: 'Regensburg',
      year: 2024,
      title_en: "New Year's Eve in Regensburg",
      title_de: 'Silvester in Regensburg',
      description_en:
        'As the old year comes to an end and the first fireworks rise over Regensburg at midnight, the city’s appearance changes within just a few moments.\n\nCountless small fireworks light up over the rooftops all at once, bathing the night sky in ever-changing colors. Seen from a distance, the individual rockets blend into an impressive sea of light that stretches across large parts of the city.\n\nFor me, this moment is something special every year.',
      description_de:
        'Wenn das alte Jahr zu Ende geht und um Mitternacht die ersten Feuerwerke über Regensburg aufsteigen, verändert sich das Bild der Stadt innerhalb weniger Augenblicke.\n\nÜber den Dächern leuchten unzählige kleine Feuerwerke gleichzeitig auf und tauchen den Nachthimmel immer wieder in neue Farben. Aus der Ferne betrachtet verschmelzen die einzelnen Raketen zu einem beeindruckenden Lichtermeer, das sich über weite Teile der Stadt erstreckt.\n\nFür mich ist dieser Moment jedes Jahr etwas Besonderes.'
    }
  ];

  const insertVideo = db.prepare(
    'INSERT INTO home_videos (sort_order, src, location, year, title_en, title_de, description_en, description_de) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  videos.forEach((v, i) =>
    insertVideo.run(i, v.src, v.location, v.year ?? null, v.title_en, v.title_de, v.description_en, v.description_de)
  );
}

function seedProjects(db: DatabaseSync) {
  const projects = [
    {
      id: 'bike-tracker',
      image: '/images/projects/gpstracker.png',
      images: null as string[] | null,
      status: 'completed',
      year: 2022,
      title_en: 'Bike Tracker',
      title_de: 'Bike Tracker',
      description_en:
        "I built this a few years ago because I needed it. Someone stole parts off my bike — the bike computer and the front light were taken right off the handlebars. At the time you could only buy an alarm or a GPS tracker, not both together, so I built my own. You can check it from an app.",
      description_de:
        'Der Bike Tracker ist eine Projektidee, die ich vor etwa drei Jahren aus der Not heraus entwickelt habe. Der Grund dafür war ein Diebstahl an meinem Fahrrad, bei dem der Fahrradcomputer und das Frontlicht vom Lenker entfernt wurden. Da der Markt derzeit nur Alarmanlagen oder GPS-Tracker anbietet, aber nicht die Kombination aus beidem, habe ich das Ganze selbst entwickelt — überwachbar per App.',
      tags_en: ['GPS Tracking', 'Mobile App', 'IoT', 'Arduino'],
      tags_de: ['GPS-Tracking', 'Mobile App', 'IoT', 'Arduino'],
      link_label_en: 'View on GitHub',
      link_label_de: 'Auf GitHub ansehen',
      link_url: 'https://github.com/dev-dany97/raspi_gps_tracker'
    },
    {
      id: 'magic-mirror',
      image: '/images/projects/magic-mirror.jpg',
      images: null,
      status: 'completed',
      year: 2025,
      title_en: 'Magic Mirror',
      title_de: 'Magic Mirror',
      description_en: 'A big, flexible project with a lot of possibilities. I use it to see important dates, events and news, and to start my day with a nice quote.',
      description_de: 'Das Magic-Mirror-Projekt ist sehr umfangreich, aber auch flexibel mit endlosen Möglichkeiten. Ich nutze es, um über wichtige Termine, Events und Neuigkeiten informiert zu sein und den Tag mit schönen Sprüchen zu beginnen.',
      tags_en: ['Raspberry Pi', 'JavaScript', 'Smart Display'],
      tags_de: ['Raspberry Pi', 'JavaScript', 'Smart Display'],
      link_label_en: 'View on GitHub',
      link_label_de: 'Auf GitHub ansehen',
      link_url: 'https://github.com/dev-dany97/magicMirror'
    },
    {
      id: 'pi-hole',
      image: '/images/projects/pihole.png',
      images: null,
      status: 'completed',
      year: 2017,
      title_en: 'Pi Hole - Ad Blocker',
      title_de: 'Pi-hole - Werbeblocker',
      description_en: 'Pi-hole adds an extra layer of security to my home network — it blocks ads and trackers for every device on the network. It runs on a Raspberry Pi 3.',
      description_de: 'Das Pi-hole-Projekt fügt dem eigenen Heimnetzwerk eine zusätzliche Sicherheitsebene hinzu, um unerwünschte Werbung und Tracking netzwerkweit zu blockieren. Pi-hole läuft auf einem Raspberry Pi III.',
      tags_en: ['Raspberry Pi', 'Networking', 'Privacy'],
      tags_de: ['Raspberry Pi', 'Netzwerk', 'Privatsphäre'],
      link_label_en: 'Visit pi-hole.net',
      link_label_de: 'pi-hole.net besuchen',
      link_url: 'https://pi-hole.net/'
    },
    {
      id: 'homeassistant',
      image: '/images/projects/homeassistant-1.png',
      images: [
        '/images/projects/homeassistant-1.png',
        '/images/projects/homeassistant-2.jpg',
        '/images/projects/homeassistant-3.jpg',
        '/images/projects/homeassistant-4.jpg'
      ],
      status: 'active',
      year: 2020,
      title_en: 'HomeAssistant',
      title_de: 'HomeAssistant',
      description_en: 'Home Assistant is an open-source platform that lets you build your own smart home system by connecting and automating different devices. Mine runs on a Raspberry Pi 4.',
      description_de: 'Home Assistant ist eine Open-Source-Plattform, mit der man durch die Integration und Automatisierung verschiedener Geräte und Dienste ein zentralisiertes, individuell anpassbares Smart-Home-System aufbauen kann. HomeAssistant läuft bei mir auf einem Raspberry Pi IV.',
      tags_en: ['Raspberry Pi', 'Home Automation', 'Smart Home'],
      tags_de: ['Raspberry Pi', 'Hausautomatisierung', 'Smart Home'],
      link_label_en: 'Visit home-assistant.io',
      link_label_de: 'home-assistant.io besuchen',
      link_url: 'https://www.home-assistant.io/'
    },
    {
      id: 'own-website',
      image: '/images/projects/website.png',
      images: null,
      status: 'active',
      year: 2024,
      title_en: 'Own Website',
      title_de: 'Eigene Webseite',
      description_en: 'This website. Built with Next.js and Bootstrap, and hosted on AWS.',
      description_de: 'Die Erstellung dieser Webseite. Sie basiert auf Next.js in Kombination mit Bootstrap als Frontend-CSS-Framework und wird über einen AWS-Bucket gehostet.',
      tags_en: ['Next.js', 'React', 'AWS'],
      tags_de: ['Next.js', 'React', 'AWS'],
      link_label_en: 'View on GitHub',
      link_label_de: 'Auf GitHub ansehen',
      link_url: 'https://github.com/dev-dany97/homepage'
    },
    {
      id: 'crypto-trading-bot',
      image: '/images/projects/cryptotrading-bot.png',
      images: null,
      status: 'experimental',
      year: 2023,
      title_en: 'Crypto Trading Bot',
      title_de: 'Crypto Trading Bot',
      description_en: 'This bot watches the price of a few cryptocurrencies and buys or sells automatically when the price is low or high.',
      description_de: 'Der Crypto Trading Bot überwacht aktuelle Preisänderungen ausgewählter Kryptowährungen und kauft oder verkauft, wenn der Preis niedrig oder hoch ist — so werden Handelsentscheidungen automatisiert.',
      tags_en: ['Python', 'Trading API', 'Automation'],
      tags_de: ['Python', 'Trading-API', 'Automatisierung'],
      link_label_en: null,
      link_label_de: null,
      link_url: null
    },
    {
      id: 'radar-recognition',
      image: '/images/projects/radar.png',
      images: null,
      status: 'completed',
      year: 2021,
      title_en: 'Radar Recognition',
      title_de: 'Radar-Erkennung',
      description_en: 'This project looks at object recognition and what you could automate with it — like opening a garage door automatically when it detects something.',
      description_de: 'Das Projekt untersucht Objekterkennung und mögliche automatisierte Aktionen, wie zum Beispiel das automatische Öffnen eines Garagentors basierend auf erkannten Objekten.',
      tags_en: ['Computer Vision', 'Object Detection', 'Hardware'],
      tags_de: ['Computer Vision', 'Objekterkennung', 'Hardware'],
      link_label_en: null,
      link_label_de: null,
      link_url: null
    },
    {
      id: 'water-quality',
      image: '/images/projects/waterqualitysystem.png',
      images: null,
      status: 'experimental',
      year: 2026,
      title_en: 'Water Quality Testing System',
      title_de: 'Wasserqualitäts-Testsystem',
      description_en: "If you have an aquarium or a pond with fish or other animals in it, you're responsible for them. A lot of people don't really know how good or bad their water quality is. This system measures the important values all the time and shows them to you.",
      description_de: 'Wer ein Aquarium oder einen Teich besitzt und darin Lebewesen hält, trägt auch eine gewisse Verantwortung. Viele wissen nicht, wie gut oder schlecht die Wasserqualität ist, in der Fische, Schnecken oder andere Tiere leben. Dieses System misst kontinuierlich zentrale Parameter und meldet sie.',
      tags_en: ['IoT', 'Sensors', 'Raspberry Pi'],
      tags_de: ['IoT', 'Sensoren', 'Raspberry Pi'],
      link_label_en: null,
      link_label_de: null,
      link_url: null
    }
  ];

  const insert = db.prepare(`
    INSERT INTO projects (id, sort_order, image, images, status, year, title_en, title_de, description_en, description_de, tags_en, tags_de, link_label_en, link_label_de, link_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  projects.forEach((p: typeof projects[number] & { year?: number | null }, i) => {
    insert.run(
      p.id,
      i,
      p.image,
      p.images ? JSON.stringify(p.images) : null,
      p.status,
      p.year ?? null,
      p.title_en,
      p.title_de,
      p.description_en,
      p.description_de,
      JSON.stringify(p.tags_en),
      JSON.stringify(p.tags_de),
      p.link_label_en,
      p.link_label_de,
      p.link_url
    );
  });
}

function buildGallery(folder: string, count: number, prefix: string): string[] {
  return Array.from({ length: count }, (_, i) => `/images/travel/${folder}/${prefix}${i + 1}.jpg`);
}

function seedTravel(db: DatabaseSync) {
  const sailingFiles = [
    'sailing1.jpg', 'sailing2.jpg', 'sailing3.jpg', 'sailing4.jpg', 'sailing5.jpg', 'sailing6.jpg',
    'sailing7.JPG', 'sailing8.jpg', 'sailing9.jpg', 'sailing10.jpg', 'sailing11.jpg', 'sailing12.jpg',
    'sailing13.jpg', 'sailing14.JPG', 'sailing15.JPG', 'sailing16.JPG', 'sailing17.JPG', 'sailing18.JPG',
    'sailing19.jpg', 'sailing20.JPG', 'sailing21.JPG', 'sailing22.JPG', 'sailing23.jpg', 'sailing24.JPG',
    'sailing25.JPG', 'sailing26.jpg', 'sailing27.jpg', 'sailing28.jpg', 'sailing29.jpg', 'sailing30.jpg',
    'sailing31.jpg', 'sailing32.jpg', 'sailing33.jpg'
  ].map((f) => `/images/travel/sailing/${f}`);

  const destinations = [
    {
      id: 'sailing', flag: 'IT', image: '/images/travel/sailing/sailing1.jpg', imageCount: 33, gallery: sailingFiles,
      name_en: 'Sardinia', name_de: 'Sardinien',
      description_en:
        "A sailing trip along one of Italy's most beautiful Mediterranean islands — from Olbia all the way to Bonifacio, at the impressive southern tip of Corsica. Definitely a trip that's stayed with me.",
      description_de:
        'Ein Segeltrip entlang einer der schönsten Mittelmeerinseln Italiens – von Olbia bis nach Bonifacio an der beeindruckenden Südspitze Korsikas. Definitiv eine Reise, die mir in Erinnerung geblieben ist.'
    },
    {
      id: 'dubai', flag: 'AE', image: '/images/travel/dubai/dubai1.jpg', imageCount: 8, gallery: buildGallery('dubai', 8, 'dubai'),
      name_en: 'Dubai', name_de: 'Dubai',
      description_en:
        'On my way to Australia, I made a three-day stopover in Dubai. Not exactly cheap, but the impressive malls, modern architecture, and sheer scale of the city definitely make it worth a visit.',
      description_de:
        'Auf meinem Weg nach Australien habe ich für drei Tage einen Zwischenstopp in Dubai eingelegt. Nicht gerade günstig, aber die beeindruckenden Malls, die moderne Architektur und die Dimensionen der Stadt sind definitiv einen Besuch wert.'
    },
    {
      id: 'bangkok', flag: 'TH', image: '/images/travel/bangkok/bangkok1.jpg', imageCount: 16, gallery: buildGallery('bangkok', 16, 'bangkok'),
      name_en: 'Bangkok', name_de: 'Bangkok',
      description_en:
        'For me, Bangkok was a city full of contrasts: chaotic and, in places, marked by real poverty, yet at the same time incredibly modern and full of life. What impressed me most, though, was the Thai culture and its people.',
      description_de:
        'Bangkok war für mich eine Stadt voller Gegensätze: chaotisch und teilweise von großer Armut geprägt, gleichzeitig aber unglaublich modern und lebendig. Am meisten beeindruckt haben mich jedoch die thailändische Kultur und die Menschen.'
    },
    {
      id: 'paris', flag: 'FR', image: '/images/travel/paris/paris1.jpg', imageCount: 10, gallery: buildGallery('paris', 10, 'paris'),
      name_en: 'Paris', name_de: 'Paris',
      description_en:
        "As a passionate Valorant player, there was no way I'd miss the Valorant Champions 2025, held in Paris — just a 1.5-hour flight away. The perfect excuse for a short trip, and a chance to finally explore a city that had been on my bucket list for a long time.",
      description_de:
        'Als leidenschaftlicher Valorant-Gamer konnte ich mir die Valorant Champions 2025 die in Paris ausgetragen wurden und nur 1,5h Flugzeit entfernt sind, natürlich nicht entgehen lassen. Die perfekte Gelegenheit für einen Kurztrip und um endlich eine Stadt zu entdecken, die schon lange auf meiner Bucketlist stand.'
    },
    {
      id: 'canary-islands', flag: 'ES', image: '/images/travel/canary-islands/canary1.jpg', imageCount: 31, gallery: buildGallery('canary-islands', 31, 'canary'),
      name_en: 'Canary Islands', name_de: 'Kanarische Inseln',
      description_en:
        "One of my most adventurous sailing trips so far, with a crew you honestly couldn't wish for a better one. And if you remember that fierce storm front over the Canary Islands: I was there and I was sailing :D",
      description_de:
        'Einer meiner bisher abenteuerlichsten Segeltrips mit einer Crew, wie man sie sich besser kaum wünschen könnte. Und wer sich an die heftige Sturmfront über den Kanaren erinnert: I was there and I was sailing :D'
    },
    {
      id: 'italy-trip', flag: 'IT', image: '/images/travel/italy-trip/italytrip1.jpg', imageCount: 13, gallery: buildGallery('italy-trip', 13, 'italytrip'),
      name_en: 'Italy', name_de: 'Italien',
      description_en:
        'During my studies, I got to explore Italy on a study trip together with some fellow students and our professor.',
      description_de:
        'Während meines Studiums durfte ich gemeinsam mit einigen Kommilitonen und unserem Professor Italien auf einer Studienreise entdecken.'
    },
    {
      id: 'croatia', flag: 'HR', image: '/images/travel/croatia/croatia1.jpg', imageCount: 9, gallery: buildGallery('croatia', 9, 'croatia'),
      name_en: 'Croatia', name_de: 'Kroatien',
      description_en:
        "My crew's very first sailing trip together took us to Croatia's beautiful Adriatic coast, laying the groundwork for plenty more sailing adventures to come.",
      description_de:
        'Der erste gemeinsame Segeltrip mit meiner Crew führte uns an die wunderschöne kroatische Adriaküste und legte damit den Grundstein für weitere gemeinsame Segelabenteuer.'
    },
    {
      id: 'australia', flag: 'AU', image: '/images/travel/australia/australia1.jpg', imageCount: 35, gallery: buildGallery('australia', 35, 'australia'),
      name_en: 'Australia', name_de: 'Australien',
      description_en: 'One of my biggest adventures so far: a road trip across Australia, combined with working holiday travel.',
      description_de: 'Eines meiner bisher größten Abenteuer: ein Roadtrip quer durch Australien, was mit Work & Travel verbunden war.'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO travel_destinations (id, sort_order, flag, image, image_count, gallery, name_en, name_de, description_en, description_de)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  destinations.forEach((d, i) => {
    insert.run(d.id, i, d.flag, d.image, d.imageCount, JSON.stringify(d.gallery), d.name_en, d.name_de, d.description_en, d.description_de);
  });
}

function seedSetup(db: DatabaseSync) {
  // Hardware specs (brand/product names) stay identical in both languages.
  const primary: Array<{ label: string; value: string; image?: string }> = [
    { label: 'CPU', value: 'AMD Ryzen 7 5800X3D 8-Core', image: '/images/setup/pc-setup/cpu-image.webp' },
    { label: 'GPU', value: 'ASUS ROG STRIX NVIDIA GeForce RTX 2080 Advanced', image: '/images/setup/pc-setup/graphic-image.webp' },
    { label: 'RAM', value: '32 GB - 4x G.Skill DIMM 8GB DDR4-3200, Trident Z RGB', image: '/images/setup/pc-setup/ram-image.webp' },
    { label: 'Memory SSD', value: 'Samsung 850 Pro 2.5 256GB + Samsung SSD 850 Evo 250GB + Samsung SSD 870 EVO 1TB + WD BLACK SSD AN1500 4TB', image: '/images/setup/pc-setup/memory-image.webp' },
    { label: 'Memory HDD', value: 'Western Digital WD_BLACK 4TB (WD4005FZBX)', image: '/images/setup/pc-setup/hdd-image.webp' },
    { label: 'Memory M2', value: 'SanDisk Extreme PRO M.2 500GB + WD Black SN750 500GB', image: '/images/setup/pc-setup/memory-m2.jpg' },
    { label: 'MB', value: 'ASUS ROG Strix X470-F Gaming', image: '/images/setup/pc-setup/mb-image.webp' },
    { label: 'Water Cooling', value: 'Alphacool Eisbecher Helix 250 + Alphacool Eisblock XPX Aurora Plexi Digital RGB + Alphacool Eisfluegel Aurora Durchflussanzeiger', image: '/images/setup/pc-setup/water-cooling-image.jpg' },
    { label: 'Pump', value: 'EK-D5 PWM Pump', image: '/images/setup/pc-setup/pump-image.webp' },
    { label: 'Fan', value: 'LIAN LI UNI FAN SL-INF 120 + Lian Li UNI FAN SL-INF LCD FLEX Wireless (ARGB und LCD, 120 mm, schwarz)', image: '/images/setup/pc-setup/fan-lcd-flex-image.jpg' },
    { label: 'Case', value: 'LIAN LI O11 Dynamic', image: '/images/setup/pc-setup/case-image.webp' },
    { label: 'PowerSupply', value: 'be quiet! Dark Power Pro 11 1000W', image: '/images/setup/pc-setup/power-supply-image.webp' },
    { label: 'Keyboard', value: 'SteelSeries Apex Pro', image: '/images/setup/pc-setup/keyboard-image.jpg' },
    { label: 'Mouse', value: 'Logitech G502 + Logitech G Powerplay', image: '/images/setup/pc-setup/mouse-image.jpg' },
    { label: 'Wheel', value: 'Logitech G29', image: '/images/setup/pc-setup/wheel-image.jpg' },
    { label: 'Microphone', value: 'HyperX QuadCast S', image: '/images/setup/pc-setup/microphone-image.jpg' },
    { label: 'Headset', value: 'SteelSeries Arctis Nova 5 Wireless', image: '/images/setup/pc-setup/headset-image.jpg' },
    { label: 'Monitor', value: 'Samsung C49HG90DMU 49"', image: '/images/setup/pc-setup/monitor-image.webp' },
    { label: 'Monitor', value: 'UPERFECT MDS-156F13', image: '/images/setup/pc-setup/monitor-uperfect-image.jpg' },
    { label: 'Monitor', value: 'Wisecoco 9"', image: '/images/setup/pc-setup/monitor-wisecoco-image.webp' },
    { label: 'Monitor', value: 'MPI7002', image: '/images/setup/pc-setup/monitor-mpi7002-image.webp' },
    { label: 'Cable', value: 'Motherboard 24-Pin, GPU Dual 8-Pin Cable: Streamer Plus V2', image: '/images/setup/pc-setup/cable-image.webp' },
    { label: 'Custom Water Front Plate', value: 'LIAN LI O11D XL FRONT PLATE SK2 + D5/DDC ADAPTER', image: '/images/setup/pc-setup/frontplate-image.webp' }
  ];

  const secondEn: Array<{ label: string; value: string }> = [
    { label: 'CPU', value: 'AMD Ryzen 5 5600G (with integrated Radeon graphics)' },
    { label: 'GPU', value: 'Not needed for now, the integrated Radeon graphics does the job' },
    { label: 'RAM', value: 'Corsair Vengeance DDR4 32 GB (2x16 GB)' },
    { label: 'Storage', value: 'SanDisk Extreme PRO M.2 500GB + Samsung 850 Pro 2.5 256GB' },
    { label: 'MB', value: 'ASUS TUF Gaming B550-PLUS WIFI II' },
    { label: 'Case', value: 'NZXT H510i (with RGB)' },
    { label: 'Cooling', value: 'ASUS ROG Ryujin 240 (AIO water cooling)' },
    { label: 'PowerSupply', value: 'be quiet! SFX Power 3 300W' },
    { label: 'Monitor', value: 'Samsung C24F396FHR 24" Curved' }
  ];

  const secondDe: Array<{ label: string; value: string }> = [
    { label: 'CPU', value: 'AMD Ryzen 5 5600G (mit integrierter Radeon-Grafik)' },
    { label: 'GPU', value: 'Vorerst nicht notwendig, die integrierte Radeon-Grafik reicht aus' },
    { label: 'RAM', value: 'Corsair Vengeance DDR4 32 GB (2x16 GB)' },
    { label: 'Storage', value: 'SanDisk Extreme PRO M.2 500GB + Samsung 850 Pro 2.5 256GB' },
    { label: 'MB', value: 'ASUS TUF Gaming B550-PLUS WIFI II' },
    { label: 'Case', value: 'NZXT H510i (mit RGB)' },
    { label: 'Cooling', value: 'ASUS ROG Ryujin 240 (AIO-Wasserkühlung)' },
    { label: 'PowerSupply', value: 'be quiet! SFX Power 3 300W' },
    { label: 'Monitor', value: 'Samsung C24F396FHR 24" Curved' }
  ];

  const I = '/images/setup/server/';
  const server: Array<{ label: string; en: string; de: string; image?: string }> = [
    { label: 'Case', en: 'be quiet! Silent Base 600 Window', de: 'be quiet! Silent Base 600 Window', image: I + 'case-image.webp' },
    { label: 'CPU', en: 'AMD Ryzen 5 5600', de: 'AMD Ryzen 5 5600', image: I + 'cpu-image.webp' },
    { label: 'GPU', en: 'Gigabyte GeForce GTX 1070 G1 Gaming', de: 'Gigabyte GeForce GTX 1070 G1 Gaming', image: I + 'gpu-image.webp' },
    { label: 'MB', en: 'GIGABYTE B550M X AORUS ELITE', de: 'GIGABYTE B550M X AORUS ELITE', image: I + 'mb-image.webp' },
    { label: 'RAM', en: 'HyperX Fury DDR4 32 GB (4x8 GB)', de: 'HyperX Fury DDR4 32 GB (4x8 GB)', image: I + 'ram-image.webp' },
    { label: 'Cooler', en: 'be quiet! Dark Rock Pro 5 (tower cooler)', de: 'be quiet! Dark Rock Pro 5 (Tower-Kühler)', image: I + 'cooler-image.webp' },
    { label: 'PowerSupply', en: 'Tacens Anima APIII850 850W', de: 'Tacens Anima APIII850 850W', image: I + 'psu-image.webp' },
    { label: 'Drive', en: 'ASUS BW-16D1HT Silent (Blu-ray)', de: 'ASUS BW-16D1HT Silent (Blu-ray)', image: I + 'drive-asus-image.webp' },
    { label: 'Drive', en: 'LG Electronics GH24NSD6 DVD burner', de: 'LG Electronics DVD-Brenner GH24NSD6', image: I + 'drive-lg-image.webp' },
    { label: 'Drive', en: 'Hitachi-LG Super Multi DVD burner', de: 'Hitachi-LG Super Multi DVD-Brenner', image: I + 'drive-hlg-image.webp' }
  ];

  const insert = db.prepare(`
    INSERT INTO setup_components (build, sort_order, label, value_en, value_de, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  primary.forEach((c, i) => insert.run('primary', i, c.label, c.value, c.value, c.image ?? null));
  secondEn.forEach((c, i) => insert.run('second', i, c.label, c.value, secondDe[i].value, null));
  server.forEach((c, i) => insert.run('server', i, c.label, c.en, c.de, c.image ?? null));
}

function seedFinance(db: DatabaseSync) {
  const platforms = [
    {
      id: 'binance', name: 'Binance', url: 'https://www.binance.com',
      description_en: 'The exchange I use for active crypto day-trading — fast entries and exits.',
      description_de: 'Meine Börse für aktives Krypto-Day-Trading — schnelle Ein- und Ausstiege.',
      affiliate_url: 'https://www.binance.com'
    },
    {
      id: 'trade-republic', name: 'Trade Republic', url: 'https://traderepublic.com',
      description_en: 'My broker for taking targeted positions in individual stocks.',
      description_de: 'Mein Broker für gezielte Positionen in Einzelaktien.',
      affiliate_url: 'https://refnocode.trade.re/jgh5ljqh'
    },
    {
      id: 'market-mavens', name: 'Market Mavens e.V.', url: 'https://marketmavens-ev.com/',
      description_en: "I'm a member of the student finance club at Hochschule Deggendorf, where we talk about markets and investing.",
      description_de: 'Mitglied der studentischen Finanzvereinigung an der Hochschule Deggendorf, Austausch über Märkte und Investieren.',
      affiliate_url: null
    }
  ];

  const insertPlatform = db.prepare(`
    INSERT INTO finance_platforms (id, sort_order, name, url, description_en, description_de, affiliate_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  platforms.forEach((p, i) => insertPlatform.run(p.id, i, p.name, p.url, p.description_en, p.description_de, p.affiliate_url));

  const img: Record<string, string> = {
    'boerse-de': '/images/finance/resources/logos/boerse-de.png',
    coinmarketcap: '/images/finance/resources/logos/coinmarketcap.png',
    bloomberg: '/images/finance/resources/logos/bloomberg.png',
    oaws: '/images/finance/resources/oaws.jpg',
    'wallstreet-koch': '/images/finance/resources/wallstreet-koch.jpg',
    marktgefluester: '/images/finance/resources/marktgefluester.jpg',
    capital: '/images/finance/resources/logos/capital.png',
    'handelsblatt-wiwo': '/images/finance/resources/logos/handelsblatt-wiwo.png'
  };
  const resources = [
    {
      id: 'boerse-de', name: 'Börse.de', url: 'https://www.boerse.de', category: 'Marktdaten', category_en: 'Market data',
      description_de: 'Kurse, Charts und Kennzahlen zu deutschen und internationalen Aktien. Mein schneller Blick auf Einzelwerte und Indizes.',
      description_en: 'Quotes, charts and key figures for German and international stocks. My quick check on single stocks and indices.'
    },
    {
      id: 'coinmarketcap', name: 'CoinMarketCap', url: 'https://coinmarketcap.com', category: 'Marktdaten', category_en: 'Market data',
      description_de: 'Kurse, Marktkapitalisierung und Handelsvolumen im Kryptomarkt. Fokus: Überblick über Momentum und Liquidität.',
      description_en: 'Prices, market cap and trading volume across the crypto market. Focus: a read on momentum and liquidity.'
    },
    {
      id: 'bloomberg', name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'Nachrichten', category_en: 'News',
      description_de: 'Internationale Finanz- und Wirtschaftsnachrichten. Fokus: Makro, Notenbanken und große Unternehmensmeldungen.',
      description_en: 'Global finance and business news. Focus: macro, central banks and major company news.'
    },
    {
      id: 'oaws', name: 'Ohne Aktien wird schwer', url: 'https://oaws.de/', category: 'Podcasts', category_en: 'Podcasts',
      description_de: 'Der tägliche Börsenpodcast von OMR und Scalable Capital mit Noah Leidinger, rund 12 Minuten. Fokus: was heute an der Börse wichtig ist, Aktien und Investment-Ideen.',
      description_en: 'The daily stock market podcast by OMR and Scalable Capital with Noah Leidinger, about 12 minutes. Focus: what matters on the market today, stocks and investment ideas.'
    },
    {
      id: 'wallstreet-koch', name: 'Wall Street mit Markus Koch', url: 'https://open.spotify.com/show/3rTbUHHq3tpY5XYqQkem8c', category: 'Podcasts', category_en: 'Podcasts',
      description_de: 'Markus Koch berichtet seit den 90ern von der Wall Street, täglich und featured by Handelsblatt. Fokus: US-Börse, Aktien, Anleihen und Rohstoffe.',
      description_en: 'Markus Koch has reported from Wall Street since the 90s, daily and featured by Handelsblatt. Focus: the US market, stocks, bonds and commodities.'
    },
    {
      id: 'marktgefluester', name: 'Marktgeflüster', url: 'https://open.spotify.com/show/3y9LP87SHF5b3hciAsZDBh', category: 'Podcasts', category_en: 'Podcasts',
      description_de: 'Zwei Ex-Investmentbanker, Thomas Kehl und Prof. Dr. Holger Graf, sprechen wöchentlich über Finanzen, Börse, Wirtschaft und Karriere. Fokus: Einordnung, anekdotisch und lehrreich.',
      description_en: 'Two former investment bankers, Thomas Kehl and Prof. Dr. Holger Graf, talk weekly about finance, markets, the economy and careers. Focus: context, anecdotal and educational.'
    }
,
    {
      id: 'capital', name: 'Capital', url: 'https://www.capital.de', category: 'Zeitschriften', category_en: 'Magazines',
      description_de: 'Wirtschaftsmagazin, das ich abonniert habe. Fokus: Geldanlage, Unternehmen und Hintergründe zur Wirtschaft.',
      description_en: 'Business magazine I subscribe to. Focus: investing, companies and the background to the economy.'
    },
    {
      id: 'handelsblatt-wiwo', name: 'Handelsblatt & WirtschaftsWoche', url: 'https://www.handelsblatt.com', category: 'Zeitschriften', category_en: 'Magazines',
      description_de: 'Im Abo zusammen: die führende Wirtschafts- und Finanzzeitung plus das wöchentliche Wirtschaftsmagazin. Fokus: Märkte, Unternehmen, Wirtschaftspolitik und Analysen.',
      description_en: 'Subscribed together: the leading German business newspaper plus the weekly business magazine. Focus: markets, companies, economic policy and analysis.'
    }
  ];

  const insertResource = db.prepare(
    'INSERT INTO finance_resources (id, sort_order, name, url, category, category_en, image, description_en, description_de) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  resources.forEach((r, i) =>
    insertResource.run(r.id, i, r.name, r.url, r.category, r.category_en, img[r.id] ?? null, r.description_en, r.description_de)
  );

  // Manually entered positions (Trade Republic has no public API) — quantity + buy
  // price only, used purely to compute allocation % and gain % since purchase.
  // Absolute € amounts are never exposed via the API, same privacy rule as crypto.
  // Example positions, not my real holdings.
  const stocks = [
    { ticker: 'AAPL', name: 'Apple', quantity: 1, buy_price: 100 },
    { ticker: 'AMZN', name: 'Amazon', quantity: 1, buy_price: 100 },
    { ticker: 'IS3R.DE', name: 'iShares Edge MSCI World Momentum', quantity: 1, buy_price: 100 },
    { ticker: 'MUV2.DE', name: 'Münchener Rück', quantity: 1, buy_price: 100 },
    { ticker: 'GOOGL', name: 'Alphabet', quantity: 1, buy_price: 100 }
  ];
  const insertStock = db.prepare(
    'INSERT INTO stock_positions (ticker, name, quantity, buy_price, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  stocks.forEach((s, i) => insertStock.run(s.ticker, s.name, s.quantity, s.buy_price, i));
}

function seedResume(db: DatabaseSync) {
  const experience = [
    {
      role_en: 'Developer Automotive', role_de: 'Developer Automotive', company: 'intive GmbH',
      period_en: '04/2023 – present', period_de: '04/2023 – heute',
      description_en: "I'm working on a tool that analyzes, visualizes and processes bus system data, with AI-assisted data analysis and plausibility checks.",
      description_de: 'Weiterentwicklung eines Tools zur Analyse, Visualisierung und Verarbeitung von Bussystemdaten, inkl. KI-gestützter Datenanalyse und Plausibilitätsprüfung.'
    },
    {
      role_en: 'Junior Software Developer', role_de: 'Junior Software Developer', company: 'intive GmbH',
      period_en: '01/2022 – 03/2023', period_de: '01/2022 – 03/2023',
      description_en: 'I developed software components to process radar sensor data for automotive, on ARM Cortex-R4 and FreeRTOS.',
      description_de: 'Entwicklung von Softwarekomponenten zur Verarbeitung von Radarsensordaten im Automotive-Umfeld auf ARM Cortex-R4 und FreeRTOS.'
    },
    {
      role_en: 'Working Student / Master’s Thesis', role_de: 'Werkstudent / Masterand', company: 'intive automotive GmbH',
      period_en: '08/2019 – 10/2021', period_de: '08/2019 – 10/2021',
      description_en: 'I built an embedded software component for obstacle detection, using a radar hardware accelerator (TI AWR1843BOOST).',
      description_de: 'Entwicklung einer embedded Softwarekomponente zur Hinderniserkennung mittels Radar Hardware Accelerator (TI AWR1843BOOST).'
    },
    {
      role_en: 'Working Student & Intern', role_de: 'Werkstudent & Praktikant', company: 'iNTENCE automotive electronics GmbH',
      period_en: '08/2017 – 07/2019', period_de: '08/2017 – 07/2019',
      description_en: 'Python-based build automation and tooling, plus a C#/.NET project to control a power supply for driver assistance systems.',
      description_de: 'Python-basierte Build-Automatisierung und Tooling sowie ein C#/.NET-Projekt zur Netzteilansteuerung im Fahrerassistenzumfeld.'
    }
  ];

  const insertExperience = db.prepare(`
    INSERT INTO resume_experience (sort_order, role_en, role_de, company, period_en, period_de, description_en, description_de)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  experience.forEach((e, i) =>
    insertExperience.run(i, e.role_en, e.role_de, e.company, e.period_en, e.period_de, e.description_en, e.description_de)
  );

  const education = [
    {
      degree_en: 'M.Sc. Applied Computer Science / Infotronics', degree_de: 'M.Sc. Angewandte Informatik / Infotronik',
      institution_en: 'TH Deggendorf', institution_de: 'TH Deggendorf',
      period_en: '2019 – 2021', period_de: '2019 – 2021',
      note_en: 'Grade: 1.5', note_de: 'Note: 1,5',
      thesis_en: 'Thesis: Development of an Embedded Software Component for Obstacle Detection Using a Radar Hardware Accelerator',
      thesis_de: 'Masterarbeit: Entwicklung einer embedded Softwarekomponente zur Hinderniserkennung mittels Radar Hardware Accelerator'
    },
    {
      degree_en: 'Exchange Semester', degree_de: 'Auslandssemester',
      institution_en: 'Griffith University, Brisbane, Australia', institution_de: 'Griffith University, Brisbane, Australien',
      period_en: '2020 – 2021', period_de: '2020 – 2021',
      note_en: 'GPA: 6.67 / 7.00', note_de: 'GPA: 6,67 / 7,00',
      thesis_en: '', thesis_de: ''
    },
    {
      degree_en: 'B.Sc. Computer Engineering', degree_de: 'B.Sc. Technische Informatik',
      institution_en: 'OTH Regensburg', institution_de: 'OTH Regensburg',
      period_en: '2015 – 2019', period_de: '2015 – 2019',
      note_en: '', note_de: '',
      thesis_en: 'Thesis: Analysis and Implementation of Build Time Optimization Through Massive Parallelization of a Multi-Computer System',
      thesis_de: 'Bachelorarbeit: Analyse und Umsetzung von Möglichkeiten zur Buildzeitoptimierung durch die massive Parallelisierung eines Mehrrechnersystems'
    }
  ];

  const insertEducation = db.prepare(`
    INSERT INTO resume_education (sort_order, degree_en, degree_de, institution_en, institution_de, period_en, period_de, note_en, note_de, thesis_en, thesis_de)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  education.forEach((e, i) =>
    insertEducation.run(i, e.degree_en, e.degree_de, e.institution_en, e.institution_de, e.period_en, e.period_de, e.note_en, e.note_de, e.thesis_en, e.thesis_de)
  );

  const skills = ['C/C++', 'Python', 'C#', 'JavaScript', 'VHDL', 'SQL', 'Docker', 'Git', 'CI/CD', 'UML', 'Scrum'];
  const insertSkill = db.prepare('INSERT INTO resume_skills (sort_order, name) VALUES (?, ?)');
  skills.forEach((s, i) => insertSkill.run(i, s));

  const certificates = [
    { en: 'ISTQB Certified Tester (iSQI Group)', de: 'ISTQB Certified Tester (iSQI Group)' },
    { en: 'AWS Cloud Practitioner Essentials', de: 'AWS Cloud Practitioner Essentials' },
    { en: 'Embedded Software Design & Patterns with C (MicroConsult)', de: 'Embedded-Software-Design und Patterns mit C (MicroConsult)' },
    { en: 'Autosar Architecture', de: 'Autosar Architecture' },
    { en: 'Embedded Systems Programming on ARM Cortex M3/M4', de: 'Embedded Systems Programming on ARM Cortex M3/M4' },
    { en: 'DAAD English Language Certificate', de: 'DAAD-Sprachzertifikat Englisch' }
  ];
  const insertCert = db.prepare('INSERT INTO resume_certificates (sort_order, name_en, name_de) VALUES (?, ?, ?)');
  certificates.forEach((c, i) => insertCert.run(i, c.en, c.de));
}
