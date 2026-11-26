import React from 'react';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import Steps, { type Step } from '../steps/steps';

// Шаги и обещания — с живой главной studio.pnhd.ru («Всё просто: купи, дождись, забери») и ответов FAQ про доставку
const steps: Step[] = [
  { title: 'Согласуем', text: <>Менеджер перезвонит, проверит макет и&nbsp;назовёт цену и&nbsp;срок</> },
  { title: 'Оплати', text: <>Картой любого банка. Бонусами&nbsp;— до&nbsp;50% суммы</> },
  { title: 'Забери', text: <>В&nbsp;студии на&nbsp;Чапыгина, 1, курьером по&nbsp;Петербургу или через СДЭК по&nbsp;всей России</> },
  { title: 'Проверь', text: <>Если с&nbsp;вещью что-то не&nbsp;так&nbsp;— заменим</> },
];

/** «Как получить заказ»: что происходит после заявки — от звонка менеджера до получения и проверки. */
const Delivery: React.FC = () => (
  <Section tone="white" id="delivery" labelledBy="delivery-title">
    <SectionHead
      titleId="delivery-title"
      title={<>Как получить заказ</>}
      lead="После заявки всё просто: согласовали, оплатили, забрали"
    />
    <Steps items={steps} />
  </Section>
);

export default Delivery;
