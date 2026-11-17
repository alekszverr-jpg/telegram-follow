import { SendIcon, ShieldIcon, TrendIcon, UsersIcon } from "./Icons";

const items = [
  {
    title: "Только живые люди",
    text: "Реальные пользователи подписываются за вознаграждение. Автоматические подписки и ботов не используем.",
    icon: UsersIcon
  },
  {
    title: "Проверка перед запуском",
    text: "Перед стартом смотрим оформление, описание и последние посты, чтобы оценить готовность канала к запуску.",
    icon: ShieldIcon
  },
  {
    title: "Задания на подписку",
    text: "Размещаем оплачиваемое задание с вашей ссылкой на канал.",
    icon: SendIcon
  },
  {
    title: "Постепенный прирост",
    text: "Подписчики приходят по мере выполнения заданий. Срок зависит от выбранного пакета.",
    icon: TrendIcon
  }
];

export function TrustBadges() {
  return (
    <section className="section-pad bg-white">
      <div className="container-shell">
        <div className="benefits-grid">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="benefit-item">
                <div className="icon-tile">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

