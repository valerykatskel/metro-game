<template>
  <div class="app-sharelist">
    <header>Поделиться:</header>
    <ul class="b-sharelist">
      <li class="b-sharelist__li">
        <a
          id="share-vk"
          data-inc="1"
          rel="nofollow"
          target="_blank"
          title="Поделиться с друзьями в Vkontakte"
          class="socshare-link"
          href="https://vk.com/share.php?url="
        >
          <span class="b-socshare m-vk">
            <i class="soc-icon b-icon icon-vk"></i>
          </span>
        </a>
      </li>
      <li class="b-sharelist__li">
        <a
          id="shareLinkFB"
          data-inc="1"
          rel="nofollow"
          target="_blank"
          title="Поделиться с друзьями в Facebook"
          class="socshare-link"
          href="https://www.facebook.com/sharer.php?u="
        >
          <span class="b-socshare m-fb">
            <i class="soc-icon b-icon icon-fb"></i>
          </span>
        </a>
      </li>
      <li class="b-sharelist__li">
        <a
          id="shareLinkTW"
          data-inc="1"
          rel="nofollow"
          target="_blank"
          title="Поделиться с друзьями в Twitter"
          class="socshare-link"
          href="https://twitter.com/intent/tweet?url="
        >
          <span class="b-socshare m-twt">
            <i class="soc-icon b-icon icon-twt"></i>
          </span>
        </a>
      </li>
      <li class="b-sharelist__li">
        <a
          id="shareLinkOD"
          data-inc="1"
          rel="nofollow"
          target="_blank"
          title="Поделиться с друзьями в Одноклассниках"
          class="socshare-link"
          href="https://connect.ok.ru/offer?url="
        >
          <span class="b-socshare m-od">
            <i class="soc-icon b-icon icon-od"></i>
          </span>
        </a>
      </li>
      <li class="b-sharelist__li">
        <a
          id="shareLinkTG"
          rel="nofollow"
          target="_blank"
          title="Поделиться с друзьями в Telegram"
          class="socshare-link"
          href="https://t.me/share/url?url="
        >
          <span class="b-socshare m-tg">
            <i class="b-icon icon-tg"></i>
          </span>
        </a>
      </li>
      <li class="b-sharelist__li">
        <a
          id="shareLinkVB"
          rel="nofollow"
          target="_blank"
          title="Поделиться с друзьями в Viber"
          class="socshare-link"
          href="viber://forward?text="
        >
          <span class="b-socshare m-vb">
            <i class="b-icon icon-vb"></i>
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.app-sharelist {
  display: none;
}
.smart,
.desktop {
  .app-sharelist {
    margin-top: 20px;
    display: inline-block;
    header {
      margin-bottom: 10px;
      font-size: 15px;
      line-height: 21px;
    }
  }
  .b-sharelist {
    list-style-type: none;
    margin-top: 0;
    padding: 0;
    .b-sharelist__li {
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }

  @media (min-width: 481px) {
    .app-sharelist {
      margin-top: 30px;
    }
  }
}
</style>
