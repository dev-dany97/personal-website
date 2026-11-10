'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { AutoplayVideo } from '@/app/components/AutoplayVideo';
import { FlowCanvas } from './_components/FlowCanvas';
import { RgbController } from './_components/RgbController';
import { ModelChamber, type ModelChamberHandle } from './_components/ModelChamber';
import { HardwareMatrix, type HardwareComponent } from './_components/HardwareMatrix';
import { ValorantCard } from './_components/ValorantCard';
import { GtaCountdown } from './_components/GtaCountdown';
import { Sparkline, formatNumber, useTelemetry } from './_components/telemetry';
import type { SceneState } from './_components/scene';
import { SiteImage } from '@/app/components/SiteImage';
import { ImageLightbox } from '@/app/components/ImageLightbox';

// Large video files are hosted on S3/CloudFront rather than bundled under
// /public — falls back to the local /public/videos path when unset.
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '';

interface SetupContent {
  title: string;
  lead: string;
  highEndTitle: string;
  highEndDesc: string;
  waterCoolingTitle: string;
  waterCoolingIntro: string;
  bullets: { title: string; text: string }[];
  tipsTitle: string;
  tipsText: string;
  explore3dTitle: string;
  explore3dText: string;
  umbauTitle: string;
  umbauDesc: string;
  printTitle: string;
  printText: string;
  printAlt: string;
  printPhotoAlts?: string[];
  spikeTitle: string;
  spikeText: string;
  setupPhotoAlt: string;
  setupPhotoCaption: string;
  componentsPhotoTitle: string;
  componentsPhotoCaption: string;
  componentsPhotoAlt: string;
  secondBuildTitle: string;
  secondBuildDesc: string;
  secondBuildCostLabel?: string;
  secondBuildCost?: string;
  secondBuildCostNote?: string;
  hardwareTitle: string;
  hardwareDisclaimer: string;
  pc2Components: HardwareComponent[];
  serverTitle: string;
  serverDesc: string;
  serverPhotoAlt: string;
  serverComponents: HardwareComponent[];
}

interface SetupResponse {
  primaryComponents: HardwareComponent[];
  en: SetupContent;
  de: SetupContent;
}

// Labels only the layout needs. The actual texts come
// from the database (src/lib/seed-data.ts).
const UI = {
  de: {
    heroEyebrow: 'SYS://GAMING · Build 01 · Custom Loop',
    startModel: '3D-Modell starten', seeHardware: 'Hardware ansehen',
    postLabel: 'Systemcheck', loopLine: 'Alphacool Custom Loop · Druck stabil',
    flow: 'Durchfluss', play: 'Video abspielen', pause: 'Video pausieren',
    heroVideo: 'Rundgang um den umgebauten PC',
    loopEyebrow: 'Kreislauf · Alphacool', monitor: 'Loop-Monitor', water: 'Wasser', pump: 'Pumpe',
    waterPhotoAlt: 'Wasserkühlung im LIAN LI O11 Dynamic',
    warnTags: ['Lecks', 'Korrosion', 'Wartung', 'Drucktest'],
    modelEyebrow: 'Interaktiv · WebGL', hwEyebrow: 'Spec-Matrix · Build 01', setupEyebrow: 'Mein Setup', setupTitle: 'Battlestation',
    logEyebrow: 'Build-Log', logTitle: 'Vom Karton zum Neon-Umbau',
    stepUnboxing: 'Unboxing', stepFirst: 'Erster Aufbau', stepRebuild: 'Umbau', stepPrint: '3D-Druck',
    b2Eyebrow: 'Build 02 · Minimalistischer und effizienter PC', b3Eyebrow: 'Build 03 · Server/Workstation',
    enlarge: 'Bild vergrößern', close: 'Schließen', previous: 'Vorheriges Bild', next: 'Nächstes Bild'
  },
  en: {
    heroEyebrow: 'SYS://GAMING · Build 01 · Custom loop',
    startModel: 'Start the 3D model', seeHardware: 'See the hardware',
    postLabel: 'System check', loopLine: 'Alphacool custom loop · pressure stable',
    flow: 'Flow', play: 'Play video', pause: 'Pause video',
    heroVideo: 'A walk around the rebuilt PC',
    loopEyebrow: 'Loop · Alphacool', monitor: 'Loop monitor', water: 'Coolant', pump: 'Pump',
    waterPhotoAlt: 'Water cooling inside the LIAN LI O11 Dynamic',
    warnTags: ['Leaks', 'Corrosion', 'Maintenance', 'Leak test'],
    modelEyebrow: 'Interactive · WebGL', hwEyebrow: 'Spec matrix · Build 01', setupEyebrow: 'My setup', setupTitle: 'Battlestation',
    logEyebrow: 'Build log', logTitle: 'From the boxes to the neon rebuild',
    stepUnboxing: 'Unboxing', stepFirst: 'First build', stepRebuild: 'Rebuild', stepPrint: '3D printing',
    b2Eyebrow: 'Build 02 · Minimalist and efficient PC', b3Eyebrow: 'Build 03 · Server/Workstation',
    enlarge: 'Enlarge image', close: 'Close', previous: 'Previous image', next: 'Next image'
  }
};

const NEON_PHOTOS = ['/images/setup/neon-druck-roh.webp', '/images/setup/neon-druck-bemalt.webp'];

const BENEFIT_ICONS = [
  <path key="t" d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z" />,
  <path key="o" d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  <path key="s" d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />,
  <path key="p" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
];

// Highlights the word "Gaming" in the title as neon lettering.
function HeroTitle({ title }: { title: string }) {
  const parts = title.split(/(Gaming)/);
  return <h1>{parts.map((p, i) => (p === 'Gaming' ? <span key={i} className="gx-glow">{p}</span> : p))}</h1>;
}

export default function Setup() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const ui = UI[lang];
  const [data, setData] = useState<SetupResponse | null>(null);
  const [overclock, setOverclock] = useState(false);
  // Fullscreen view: which images are open and which one of them.
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; alt: string } | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneState>({ h1: 186, h2: 262, overclock: false });
  const modelRef = useRef<ModelChamberHandle>(null);
  const tele = useTelemetry(sceneRef);

  useEffect(() => {
    fetch('/api/setup')
      .then((res) => res.json())
      .then(setData);
  }, []);

  // Sections below the fold slide in slightly while scrolling.
  // They are always visible, just slightly offset.
  useEffect(() => {
    const host = hostRef.current;
    if (!data || !host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.remove('gx-pre');
      if (e.target.hasAttribute('data-scan')) e.target.classList.add('gx-scanned');
      io.unobserve(e.target);
    }), { threshold: 0.12 });
    host.querySelectorAll('.gx-rv, [data-scan]').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add('gx-pre');
      io.observe(el);
    });
    return () => io.disconnect();
  }, [data]);

  // Canvas and telemetry read overclock from the ref every frame.
  useEffect(() => { sceneRef.current.overclock = overclock; }, [overclock]);

  if (!data) {
    return (
      <main>
        <Navbar currentPage="/setup" />
        <div className="gx gx-loading" />
      </main>
    );
  }

  const c = data[lang];
  const spec = (label: string) => data.primaryComponents.find((x) => x.label === label)?.value ?? '';
  const toggle = { className: 'gx-icon-btn gx-vid-ctl', playLabel: ui.play, pauseLabel: ui.pause };

  return (
    <main>
      <Navbar currentPage="/setup" />

      <div className={`gx${overclock ? ' gx-oc-on' : ''}`} ref={hostRef}>
        <header className="gx-hero" id="top">
          <FlowCanvas scene={sceneRef} />
          <div className="gx-wrap">
            <div className="gx-rv">
              <div className="gx-eyebrow">{ui.heroEyebrow}</div>
              <HeroTitle title={c.title} />
              <p className="gx-lead">{c.lead}</p>
              <div className="gx-cta-row">
                <a className="gx-btn gx-primary" href="#modell" onClick={() => modelRef.current?.activate()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" />
                  </svg>
                  {ui.startModel}
                </a>
                <a className="gx-btn" href="#hardware">{ui.seeHardware}</a>
              </div>
              <div className="gx-post" aria-label={ui.postLabel}>
                {[['CPU', spec('CPU')], ['GPU', spec('GPU').replace('ASUS ', '').replace('NVIDIA GeForce ', '')], ['RAM', spec('RAM')], ['LOOP', ui.loopLine]].map(([k, v]) => (
                  <div key={k}><span className="gx-k">{k}</span><span className="gx-v">{v}</span><span className="gx-ok">OK</span></div>
                ))}
              </div>
            </div>

            <div className="gx-stage gx-rv">
              <div className="gx-screen gx-hud">
                <AutoplayVideo
                  src={`${MEDIA_BASE_URL}/videos/setup/Gaming_PC_Loop.mp4`}
                  fallbackSrc={`${MEDIA_BASE_URL}/videos/setup/Gaming_PC_Umbau.mp4`}
                  poster="/images/setup/loop-poster.jpg"
                  ariaLabel={ui.heroVideo}
                  toggle={toggle}
                />
                <div className="gx-scan" />
              </div>
              <div className="gx-chip gx-c1"><small>CPU</small><b>{formatNumber(tele.cpu, lang)} °C</b></div>
              <div className="gx-chip gx-c2"><small>{ui.flow}</small><b>{formatNumber(tele.flow, lang)} L/h</b></div>
              <div className="gx-chip gx-c3"><small>GPU</small><b>{formatNumber(tele.gpu, lang)} °C</b></div>
              <div className="gx-chip gx-c4"><small>{ui.water}</small><b>{formatNumber(tele.water, lang, 1)} °C</b></div>
              <div className="gx-stage-cap">
                <h3>{c.umbauTitle}</h3>
              </div>
            </div>
          </div>
        </header>

        <ValorantCard lang={lang} />

        <GtaCountdown lang={lang} />

        <section className="gx-band" id="kuehlung">
          <div className="gx-wrap">
            <div className="gx-sec-head gx-rv">
              <span className="gx-eyebrow">{ui.loopEyebrow}</span>
              <h2>{c.waterCoolingTitle}</h2>
              <p>{c.waterCoolingIntro}</p>
            </div>
            <div className="gx-loop">
              <div className="gx-loop-photo gx-rv">
                <SiteImage src="/images/setup/bg-gaminghead.jpg" alt={ui.waterPhotoAlt} width={1800} height={1200} sizes="(max-width: 900px) 100vw, 60vw" />
                <div className="gx-monitor gx-hud">
                  <div className="gx-monitor-top"><span className="gx-eyebrow">{ui.monitor}</span></div>
                  <div className="gx-monitor-vals">
                    <div><small>{ui.water}</small><b>{formatNumber(tele.water, lang, 1)} °C</b></div>
                    <div><small>{ui.pump}</small><b>{formatNumber(tele.pump, lang)}</b></div>
                    <div><small>Flow</small><b>{formatNumber(tele.flow, lang)}</b></div>
                  </div>
                  <Sparkline values={tele.history} scene={sceneRef} />
                </div>
              </div>
              <div className="gx-benefits">
                {c.bullets.map((b, i) => (
                  <article key={b.title} className="gx-benefit gx-rv">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{BENEFIT_ICONS[i % BENEFIT_ICONS.length]}</svg>
                    <h3>{b.title.replace(/:\s*$/, '')}</h3>
                    <p>{b.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="gx-warn gx-rv">
              <div className="gx-warn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3 2 21h20zM12 10v5M12 18v.5" /></svg>
              </div>
              <div>
                <h3>{c.tipsTitle}</h3>
                <p>{c.tipsText}</p>
                <div className="gx-tags">{ui.warnTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="gx-band" id="modell">
          <div className="gx-wrap">
            <div className="gx-sec-head gx-rv">
              <span className="gx-eyebrow">{ui.modelEyebrow}</span>
              <h2>{c.explore3dTitle}</h2>
              <p>{c.explore3dText}</p>
            </div>
            <ModelChamber ref={modelRef} lang={lang} />
          </div>
        </section>

        <section className="gx-band" id="battlestation">
          <div className="gx-wrap">
            <div className="gx-sec-head gx-rv">
              <span className="gx-eyebrow">{ui.setupEyebrow}</span>
              <h2>{ui.setupTitle}</h2>
            </div>
            <figure className="gx-setup-photo gx-hud gx-rv">
              <button
                type="button"
                className="gx-zoom"
                onClick={() => setLightbox({ images: ['/images/setup/pc-setup.jpg'], index: 0, alt: c.setupPhotoAlt })}
                aria-label={ui.enlarge}
                title={ui.enlarge}
              >
                <SiteImage src="/images/setup/pc-setup.jpg" alt={c.setupPhotoAlt} width={1800} height={1350} sizes="(max-width: 1200px) 100vw, 1200px" style={{ height: 'auto' }} />
                <span className="gx-zoom-hint" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                </span>
              </button>
              <figcaption>{c.setupPhotoCaption}</figcaption>
            </figure>
          </div>
        </section>

        <section className="gx-band" id="hardware">
          <div className="gx-wrap">
            <div className="gx-sec-head gx-rv">
              <span className="gx-eyebrow">{ui.hwEyebrow}</span>
              <h2>{c.hardwareTitle}</h2>
            </div>
            <HardwareMatrix components={data.primaryComponents} lang={lang} />
          </div>
        </section>

        <section className="gx-band" id="buildlog">
          <div className="gx-wrap">
            <div className="gx-sec-head gx-rv">
              <span className="gx-eyebrow">{ui.logEyebrow}</span>
              <h2>{ui.logTitle}</h2>
            </div>
            <div className="gx-log">
              <div className="gx-step gx-rv">
                <div className="gx-dot">01</div>
                <div className="gx-step-body">
                  <div className="gx-step-text">
                    <span className="gx-eyebrow">{ui.stepUnboxing}</span>
                    <h3>{c.componentsPhotoTitle}</h3>
                    <p>{c.componentsPhotoCaption}</p>
                  </div>
                  <div className="gx-media-frame gx-hud gx-scan-reveal" data-scan>
                    <SiteImage src="/images/setup/pc-setup/all-components.jpg" alt={c.componentsPhotoAlt} width={1920} height={1440} sizes="(max-width: 900px) 100vw, 50vw" style={{ height: 'auto' }} />
                  </div>
                </div>
              </div>
              <div className="gx-step gx-rv">
                <div className="gx-dot">02</div>
                <div className="gx-step-body gx-flip">
                  <div className="gx-step-text">
                    <span className="gx-eyebrow">{ui.stepFirst}</span>
                    <h3>{c.highEndTitle}</h3>
                    <p>{c.highEndDesc}</p>
                  </div>
                  <div className="gx-media-frame gx-hud gx-tall gx-video-frame">
                    <AutoplayVideo src={`${MEDIA_BASE_URL}/videos/setup/Gaming_PC.mp4`} ariaLabel={c.highEndTitle} toggle={toggle} />
                  </div>
                </div>
              </div>
              <div className="gx-step gx-rv">
                <div className="gx-dot">03</div>
                <div className="gx-step-body">
                  <div className="gx-step-text">
                    <span className="gx-eyebrow">{ui.stepPrint}</span>
                    <h3>{c.printTitle}</h3>
                    <p>{c.printText}</p>
                  </div>
                  <div className="gx-media-frame gx-hud gx-scan-reveal" data-scan>
                    <SiteImage src="/images/setup/neon-transition.jpg" alt={c.printAlt} className="gx-wide-img" width={1600} height={900} sizes="(max-width: 900px) 100vw, 50vw" style={{ height: 'auto' }} />
                  </div>
                  <div className="gx-neon-photos">
                    {NEON_PHOTOS.map((src, i) => {
                      const alt = c.printPhotoAlts?.[i] ?? c.printAlt;
                      return (
                        <button
                          key={src}
                          type="button"
                          className="gx-media-frame gx-hud gx-zoom"
                          onClick={() => setLightbox({ images: NEON_PHOTOS, index: i, alt: c.printTitle })}
                          aria-label={`${ui.enlarge}: ${alt}`}
                        >
                          <SiteImage src={src} alt={alt} width={1200} height={1600} sizes="(max-width: 900px) 50vw, 25vw" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="gx-step gx-rv">
                <div className="gx-dot">04</div>
                <div className="gx-step-body gx-flip">
                  <div className="gx-step-text">
                    <span className="gx-eyebrow">{ui.stepPrint}</span>
                    <h3>{c.spikeTitle}</h3>
                    <p>{c.spikeText}</p>
                  </div>
                  <div className="gx-media-frame gx-hud gx-tall gx-video-frame">
                    {/* Short clip (2.5 MB), kept in the repo instead of the video CDN */}
                    <AutoplayVideo src="/media/setup/spike.mp4" poster="/images/setup/spike-poster.jpg" ariaLabel={c.spikeTitle} toggle={toggle} />
                  </div>
                </div>
              </div>
              <div className="gx-step gx-rv">
                <div className="gx-dot">05</div>
                <div className="gx-step-body">
                  <div className="gx-step-text">
                    <span className="gx-eyebrow">{ui.stepRebuild}</span>
                    <h3>{c.umbauTitle}</h3>
                    <p>{c.umbauDesc}</p>
                  </div>
                  <div className="gx-media-frame gx-hud gx-tall gx-video-frame">
                    <AutoplayVideo src={`${MEDIA_BASE_URL}/videos/setup/Gaming_PC_Umbau.mp4`} ariaLabel={c.umbauTitle} toggle={toggle} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gx-band" id="build2">
          <div className="gx-wrap">
            <div className="gx-sec-head gx-rv">
              <span className="gx-eyebrow">{ui.b2Eyebrow}</span>
              <h2>{c.secondBuildTitle}</h2>
              <p>{c.secondBuildDesc}</p>
            </div>
            <div className="gx-b2">
              <div className="gx-media-frame gx-hud gx-video-frame gx-rv">
                <AutoplayVideo src={`${MEDIA_BASE_URL}/videos/setup/Gaming_PC2.mp4`} ariaLabel={c.secondBuildTitle} toggle={toggle} />
              </div>
              <div className="gx-rv">
                {c.secondBuildCost && (
                  <div className="gx-cost">
                    <span className="gx-eyebrow">{c.secondBuildCostLabel}</span>
                    <b>{c.secondBuildCost}</b>
                    {c.secondBuildCostNote && <small>{c.secondBuildCostNote}</small>}
                  </div>
                )}
                {c.hardwareDisclaimer && <p className="gx-note">{c.hardwareDisclaimer}</p>}
                <dl className="gx-spec-list">
                  {c.pc2Components.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="gx-band" id="build3">
          <div className="gx-wrap">
            <div className="gx-sec-head gx-rv">
              <span className="gx-eyebrow">{ui.b3Eyebrow}</span>
              <h2>{c.serverTitle}</h2>
              <p>{c.serverDesc}</p>
            </div>
            <div className="gx-b3-photos gx-rv">
              {[1, 2, 3].map((n) => (
                <SiteImage key={n} src={`/images/setup/server/server-${n}.webp`} alt={c.serverPhotoAlt} width={1000} height={1150} sizes="33vw" />
              ))}
            </div>
            {/* Ten parts, two of them wide: that fills the four-column grid without a gap. */}
            <HardwareMatrix components={c.serverComponents} lang={lang} showFilters={false} wideAt={[2, 7]} />
          </div>
        </section>

        <RgbController host={hostRef} sceneRef={sceneRef} lang={lang} overclock={overclock} setOverclock={setOverclock} />
      </div>

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          alt={lightbox.alt}
          onIndexChange={(index) => setLightbox((lb) => (lb ? { ...lb, index } : lb))}
          onClose={() => setLightbox(null)}
          labels={{ close: ui.close, previous: ui.previous, next: ui.next }}
        />
      )}

      <Footer />
    </main>
  );
}

