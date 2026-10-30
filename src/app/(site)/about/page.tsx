import type { Metadata } from 'next';
import AsciiPortrait from '@/components/AsciiPortrait';
import BrushBand from '@/components/BrushBand';
import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/db';

export const metadata: Metadata = { title: 'Обо мне' };

const paras = (t: string) => t.split(/\n{2,}/).filter(Boolean);

export default function AboutPage() {
  const s = getSettings();
  const steps = s.processSteps.split('\n').map((x) => x.trim()).filter(Boolean);

  return (
    <div className="page-top">
      <section className="about-intro">
        <AsciiPortrait src={s.portrait || '/works/liza.jpg'} alt={s.artistName} />
        <div>
          <h1 className="display h-xl" style={{ marginBottom: '1.6rem' }}>
            Привет, я {s.artistName}
          </h1>
          <div className="prose">
            {paras(s.bio).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <BrushBand src="/textures/strokes-slate.jpg" text={s.bandAbout} link={{ href: '/shop', label: 'смотреть работы' }} />

      <section className="about-block">
        <div>
          <h2 className="display h-lg" style={{ marginBottom: '1.4rem' }}>
            О работах
          </h2>
          <div className="prose">
            {paras(s.worksText).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <figure className="figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/works/expo.jpg" alt="Работы Лизы в экспозиции" loading="lazy" />
          <figcaption>Работы в экспозиции</figcaption>
        </figure>
      </section>

      <section className="about-block about-block--flip">
        <div>
          <h2 className="display h-lg" style={{ marginBottom: '1.4rem' }}>
            Процесс
          </h2>
          <div className="prose">
            {paras(s.processText).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {steps.length > 0 && (
            <ol className="steps">
              {steps.map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ol>
          )}
        </div>
        <figure className="figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/works/process.jpg" alt="Лиза пишет работу на вырезанных фрагментах" loading="lazy" />
          <figcaption>В мастерской</figcaption>
        </figure>
      </section>

      <section className="contact" id="contact">
        <div>
          <h2 className="display h-lg" style={{ marginBottom: '1.4rem' }}>
            Написать мне
          </h2>
          <p style={{ maxWidth: '34rem' }}>Спроси про работу, цену, заказ или просто расскажи, что откликнулось. Я отвечаю сама.</p>
          <ContactForm />
        </div>
        <div>
          <h3 className="contact__h">Контакты</h3>
          <ul className="contacts-list">
            {s.email && (
              <li>
                <span>Почта</span>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </li>
            )}
            {s.telegram && (
              <li>
                <span>Телеграм</span>
                <a href={`https://t.me/${s.telegram}`} target="_blank" rel="noopener noreferrer">
                  @{s.telegram}
                </a>
              </li>
            )}
            {s.instagram && (
              <li>
                <span>Instagram</span>
                <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noopener noreferrer">
                  @{s.instagram}
                </a>
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
