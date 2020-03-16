// THIS FILE CONTAINS MOCK DATA AND SHOULD NOT GO TO PRODUCTION!
const ampConfig = {
  asset_host: "https://fea.assettype.com",
  cdn_image: "//thumbor-stg.assettype.com",
  theme: {
    name: "default",
    "logo-html":
      '<h2 class="site-logo background-logo"><a class="logo" href="/" title="Home"></a></h2>',
    fonts: {
      primary: {
        url: "playfair+display:300,400,600,700",
        family: '"Playfair Display", Lato'
      },
      secondary: {
        url: "lato:400,400italic,700,700italic",
        family: "lato"
      }
    },
    colors: {
      primary: "",
      secondary: "",
      "footer-background": "#993366",
      "footer-text-color": "",
      "header-background": "",
      "section-text-color": "#000000"
    },
    "logo-url":
      "https://images.assettype.com/barandbench/2019-12/7a743b15-5d5d-44d7-96c2-13616780ed95/brand_2x.png",
    ads: [
      {
        name: "top-ad",
        type: "industrybrains",
        width: "300",
        height: "250",
        "data-width": "300",
        "data-height": "250",
        "data-cid": "19626-3798936394"
      },
      {
        name: "story-ad",
        type: "a9",
        width: "300",
        height: "250",
        "data-amzn_assoc_ad_mode": "auto",
        "data-divid": "amzn-assoc-ad-fe746097-f142-4f8d-8dfb-45ec747632e5",
        "data-recomtype": "async",
        "data-adinstanceid": "fe746097-f142-4f8d-8dfb-45ec747632e5",
        "data-aax_size": "300x250",
        "data-aax_pubname": "test123",
        "data-aax_src": "302"
      },
      {
        name: "bottom-ad-2",
        type: "taboola",
        width: "400",
        height: "300",
        layout: "responsive",
        "data-publisher": "amp-demo",
        "data-mode": "thumbnails-a",
        "data-placement": "Ads Example",
        "data-article": "auto"
      },
      {
        name: "bottom-sticky-ad",
        width: "320",
        height: "50",
        type: "doubleclick",
        "data-slot": "/35096353/amptesting/formats/sticky"
      }
    ],
    styles:
      "<style amp-custom=\"amp-custom\">html,body,ul,ol{margin:0;padding:0}.story-page-container{min-height:calc(100vh - 70px)}p,a{font-size:1em;line-height:30px}ul{list-style:disc;margin:1px;padding-left:20px}ol{list-style:decimal;margin:1px;padding-left:20px}h2{font-size:2em;line-height:36px;padding-bottom:10px}h3{font-size:1.5em;line-height:30px;margin:15px 0;text-transform:uppercase;font-weight:900}.header{display:flex;width:100%;height:60px;position:relative}.header .site-logo{height:50px;align-self:center;margin:0;padding:0;width:200px;background-size:contain;background-position:center center;position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)}.header .site-logo .logo{height:50px;width:200px;float:left}.header.partial{padding-top:65px}.footer-container{height:70px;display:grid;align-items:center;justify-items:center;grid-template-columns:1fr;grid-template-rows:1fr 1fr;background-color:#7b7b7b}.footer-container .copyright,.footer-container .powered-by{font-size:0.875em;letter-spacing:0.27px;font-weight:400;text-align:center;text-decoration:none}.footer-container .copyright{align-self:end}.header-card-content .hero-image-container{padding-left:0}.header-card-content .section-name{font-size:1em;letter-spacing:1px;line-height:30px;text-align:left;margin:5px 15px;font-weight:700}.header-card-content .story-headline{font-size:1.5em;color:#424242;line-height:30px;margin:10px 15px;font-weight:700}.header-card-content .byline{margin:0 15px;font-size:0.75em}.header-card-content .byline .author{color:#424242;font-weight:700;margin-bottom:5px}.header-card-content .byline .published-time{color:#7b7b7b}.header-card-content .social-share-wrapper{border-bottom:1px solid #7b7b7b;margin:15px}.top-ad{text-align:center;background-color:#f4f4f4;margin:2px}.story-ad{text-align:center;margin:20px}.story-content{margin:0 auto;float:none;max-width:600px;text-align:left}.cards-content{margin:10px 0}amp-img{background-color:grey}.humanized-date{font-size:0.75em;line-height:1;display:block;font-style:italic;color:#7b7b7b}.refresh-live-blog{margin:0 auto;width:150px;height:30px;font-size:16px}.menu-hamburger{width:35px;height:5px;background-color:black;margin:6px 0}.hamburger-icon{display:inline-block;width:30px;height:24px;margin-left:15px;align-self:center;justify-self:center;-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0deg);-webkit-transition:0.5s ease-in-out;-moz-transition:0.5s ease-in-out;-o-transition:0.5s ease-in-out;transition:0.5s ease-in-out;cursor:pointer;z-index:20}.hamburger-icon span{display:block;position:absolute;height:3px;width:100%;opacity:1;left:0;-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0deg);-webkit-transition:0.25s ease-in-out;-moz-transition:0.25s ease-in-out;-o-transition:0.25s ease-in-out;transition:0.25s ease-in-out}.hamburger-icon span:nth-child(1){top:0px}.hamburger-icon span:nth-child(2),.hamburger-icon span:nth-child(3){top:10px}.hamburger-icon span:nth-child(4){top:20px}.hamburger-icon.open span:nth-child(1){top:10px;width:0%;left:50%}.hamburger-icon.open span:nth-child(2){-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg)}.hamburger-icon.open span:nth-child(3){-webkit-transform:rotate(-45deg);-moz-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg)}.hamburger-icon.open span:nth-child(4){top:10px;width:0%;left:50%}.hamburger-icon.open{left:175px}.hamburger-icon-close{width:20px;margin-left:200px;padding-top:15px;cursor:pointer}.amp-sidebar ul{list-style:none;background-color:#ffffff;font-weight:700;letter-spacing:1px;font-size:18px}.amp-sidebar ul li a{text-decoration:none;line-height:3}amp-social-share[type=\"twitter\"]{background-color:#fff;background-image:url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cpath d='M0 0h48v48H0z'/%3e%3ccircle cx='22' cy='24' r='16' fill='%2355ACEE'/%3e%3cpath fill='%23FFF' d='M33.987 18.12a9.442 9.442 0 0 1-2.26 2.33 12.8 12.8 0 0 1-.516 4.206 13.083 13.083 0 0 1-1.612 3.467 13.628 13.628 0 0 1-2.574 2.937c-.995.851-2.195 1.53-3.6 2.037-1.404.507-2.906.76-4.505.76-2.52 0-4.827-.674-6.92-2.023.326.037.688.056 1.088.056 2.093 0 3.958-.642 5.594-1.925a4.393 4.393 0 0 1-2.622-.9 4.408 4.408 0 0 1-1.59-2.225c.306.046.59.07.85.07.4 0 .796-.052 1.186-.154a4.433 4.433 0 0 1-2.588-1.555c-.683-.823-1.025-1.78-1.025-2.867v-.056a4.47 4.47 0 0 0 2.037.572 4.5 4.5 0 0 1-1.465-1.604 4.39 4.39 0 0 1-.544-2.149c0-.818.204-1.576.614-2.274a12.774 12.774 0 0 0 4.108 3.327 12.556 12.556 0 0 0 5.183 1.389 5.005 5.005 0 0 1-.112-1.033c0-1.246.44-2.309 1.319-3.188S25.974 16 27.22 16c1.303 0 2.4.474 3.293 1.423a8.836 8.836 0 0 0 2.86-1.088c-.344 1.07-1.005 1.897-1.981 2.483a8.978 8.978 0 0 0 2.595-.697z'/%3e%3c/g%3e%3c/svg%3e\")}amp-social-share[type=\"facebook\"]{background-color:#fff;background-image:url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cpath d='M0 0h48v48H0z'/%3e%3ccircle cx='24' cy='24' r='16' fill='%2339589B'/%3e%3cpath fill='%23FFF' d='M28.643 15.134v2.946H26.89c-.64 0-1.072.134-1.295.402-.223.268-.335.67-.335 1.206v2.109h3.27l-.435 3.303h-2.835v8.471h-3.415v-8.47H19v-3.304h2.846v-2.433c0-1.384.387-2.457 1.16-3.22.775-.763 1.805-1.144 3.092-1.144 1.094 0 1.942.045 2.545.134z'/%3e%3c/g%3e%3c/svg%3e\")}amp-social-share[type=\"gplus\"]{background-color:#fff;background-image:url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cpath d='M0 0h48v48H0z'/%3e%3ccircle cx='25' cy='24' r='16' fill='%23D0021B'/%3e%3cpath fill='%23FFF' d='M28.187 22.678c.082.461.122.895.122 1.302 0 1.493-.312 2.817-.936 3.97a6.773 6.773 0 0 1-2.647 2.708c-1.14.651-2.443.977-3.908.977a7.653 7.653 0 0 1-3.93-1.058 7.759 7.759 0 0 1-2.85-2.85A7.659 7.659 0 0 1 13 23.816c0-1.41.346-2.714 1.038-3.908a7.759 7.759 0 0 1 2.85-2.85A7.653 7.653 0 0 1 20.818 16c2.035 0 3.773.679 5.211 2.036l-2.117 2.036c-.814-.788-1.846-1.181-3.094-1.181-.869 0-1.677.217-2.423.651a4.775 4.775 0 0 0-1.771 1.792 4.92 4.92 0 0 0-.652 2.484c0 .895.217 1.723.652 2.483a4.775 4.775 0 0 0 1.771 1.792 4.735 4.735 0 0 0 2.423.651c.95 0 1.778-.203 2.483-.61a3.762 3.762 0 0 0 1.385-1.385c.298-.461.488-.91.57-1.343h-4.438v-2.728h7.37zm7.533.285H38v2.28h-2.28v2.28h-2.28v-2.28H31.2v-2.28h2.24v-2.28h2.28v2.28z'/%3e%3c/g%3e%3c/svg%3e\")}amp-social-share[type=\"whatsapp\"]{background-color:#fff;background-image:url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3e%3cg fill='none' fill-rule='evenodd'%3e%3ccircle cx='25' cy='24' r='16' fill='%2325D366'/%3e%3cpath fill='%23FFF' d='M32.158 17.257a9.834 9.834 0 0 1 2.1 3.075A8.943 8.943 0 0 1 35 23.915a9.006 9.006 0 0 1-1.294 4.708 9.643 9.643 0 0 1-3.477 3.435A9.233 9.233 0 0 1 25.5 33.33a9.166 9.166 0 0 1-4.496-1.145L16 33.5l1.357-4.877a9.12 9.12 0 0 1-1.272-4.708 9.12 9.12 0 0 1 1.272-4.707 9.527 9.527 0 0 1 3.435-3.436A9.12 9.12 0 0 1 25.5 14.5c1.244 0 2.439.24 3.584.721a9.883 9.883 0 0 1 3.074 2.036zM25.5 31.76a7.713 7.713 0 0 0 3.944-1.06 8.056 8.056 0 0 0 2.905-2.863 7.487 7.487 0 0 0 1.082-3.923 7.283 7.283 0 0 0-.636-2.969 8.388 8.388 0 0 0-1.76-2.565 7.858 7.858 0 0 0-2.545-1.718 7.677 7.677 0 0 0-2.99-.594 7.6 7.6 0 0 0-3.923 1.06 7.939 7.939 0 0 0-2.863 2.863 7.6 7.6 0 0 0-1.06 3.923c0 1.499.41 2.884 1.23 4.156l.17.297-.806 2.884 2.969-.763.296.17A7.562 7.562 0 0 0 25.5 31.76zm4.283-5.895l.128.085c.198.085.31.155.339.212.028.057.035.198.021.424-.014.226-.07.46-.17.7-.098.24-.325.48-.678.72-.353.241-.657.375-.912.404a3.885 3.885 0 0 1-1.145 0c-.424-.085-.99-.283-1.696-.594-1.442-.622-2.757-1.781-3.945-3.478l-.084-.085c-.622-.876-.933-1.682-.933-2.417 0-.735.254-1.371.763-1.908l.042-.043c.198-.198.41-.297.637-.297h.508a.53.53 0 0 1 .276.064c.07.042.134.148.191.318l.721 1.739c.085.17.099.31.042.424a2.92 2.92 0 0 1-.551.763.95.95 0 0 0-.212.276c-.028.07 0 .148.085.233.396.735.862 1.315 1.4 1.74.395.31.989.664 1.78 1.06.227.112.396.098.51-.043.367-.424.622-.735.763-.933.056-.113.127-.17.212-.17.085 0 .184.014.297.043.226.085.763.339 1.611.763z'/%3e%3cpath d='M0 0h48v48H0z'/%3e%3c/g%3e%3c/svg%3e\")}amp-img .caption,amp-carousel .caption{color:#fff;line-height:1;text-align:left;position:absolute;bottom:0;left:0;right:0;padding:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:smaller;max-height:30%;z-index:100}.story-element-text{color:#424242;font-size:1em;line-height:24px;text-align:left;margin:15px}.story-element-summary{font-style:italic;color:#7b7b7b}.story-element-quote,.story-element-blockquote{padding:15px 20px 15px 50px;position:relative;margin:0;font-size:1.5em;color:#424242;line-height:1.5em;text-align:left}.story-element-quote::before,.story-element-blockquote::before{content:\"\\201C\";font-size:2em;font-weight:700;color:#000;margin:12px -5px;position:absolute;left:14px;top:10px}.attribution{text-align:right;font-size:1em;margin-bottom:15px;font-weight:700}.attribution::before{content:\"-\";margin-right:5px}.story-element-blurb{font-size:1em;color:#424242;line-height:1.5em;text-align:left;border-left:3px solid #424242;padding-left:15px;margin:40px 15px}.story-element-q-and-a{font-size:1em}.story-element-q-and-a .question{color:#424242;line-height:28px;font-weight:700}.story-element-q-and-a .answer{color:#7b7b7b;line-height:24px;text-align:left;margin-top:8px}.story-element-twitter{padding:0 10px}.story-element-location{padding:15px}.story-element-bigfact{font-size:1em}.story-element-bigfact .bigfact-title{color:#424242;line-height:30px;font-size:bold;font-size:1.5em}.story-element-bigfact .bigfact-description{color:#7b7b7b;line-height:24px;text-align:left;margin-top:10px}.story-element-carousel{margin:0}.story-element-image-index{padding:1px}.story-element-gallery{background-color:#f4f4f4;margin:10px auto;padding:15px 0}.story-element-slider{margin:15px 0}blockquote{margin:10px}.related-header{margin:16px 20px;font-weight:700;font-size:1.5em;line-height:1.5}.story-card-wrapper{text-decoration:none;color:#111}.story-card{display:flex;margin:0 20px 20px 0;cursor:pointer;flex-direction:column;border-bottom:2px solid #f4f4f4}.story-card-image-wrapper{padding-bottom:8px}.story-card-image-container{padding-top:56%;position:relative;margin:0}.story-card-image{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;object-fit:cover}.story-card-content{flex-grow:1;display:flex;flex-direction:column;align-items:flex-start}.story-headline{font-size:1.5em;color:#424242;line-height:30px;margin:10px 15px;font-weight:700}.story-card-headline{font-size:1.5em;color:#424242;line-height:30px;margin:0 0 15px 0;font-weight:700}.story-card-published-at{font-size:0.75em;color:#7b7b7b}/*! normalize.css v5.0.0 | MIT License | github.com/necolas/normalize.css */html{font-family:sans-serif;line-height:1.15;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,footer,header,nav,section{display:block}h1{font-size:2em;margin:0.67em 0}figcaption,figure,main{display:block}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace, monospace;font-size:1em}a{background-color:transparent;-webkit-text-decoration-skip:objects;color:inherit}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace, monospace;font-size:1em}dfn{font-style:italic}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}img{border-style:none}svg:not(:root){overflow:hidden}button,input,optgroup,select,textarea{font-family:sans-serif;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}button,html [type=\"button\"],[type=\"reset\"],[type=\"submit\"]{-webkit-appearance:button}button::-moz-focus-inner,[type=\"button\"]::-moz-focus-inner,[type=\"reset\"]::-moz-focus-inner,[type=\"submit\"]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=\"button\"]:-moz-focusring,[type=\"reset\"]:-moz-focusring,[type=\"submit\"]:-moz-focusring{outline:1px dotted ButtonText}fieldset{border:1px solid #c0c0c0;margin:0 2px;padding:0.35em 0.625em 0.75em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{display:inline-block;vertical-align:baseline}textarea{overflow:auto}[type=\"checkbox\"],[type=\"radio\"]{box-sizing:border-box;padding:0}[type=\"number\"]::-webkit-inner-spin-button,[type=\"number\"]::-webkit-outer-spin-button{height:auto}[type=\"search\"]{-webkit-appearance:textfield;outline-offset:-2px}[type=\"search\"]::-webkit-search-cancel-button,[type=\"search\"]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details,menu{display:block}summary{display:list-item}canvas{display:inline-block}template{display:none}[hidden]{display:none}.subscribe{display:inline-flex;padding:12px 32px 16px;border-radius:5px;background-color:#e82825;margin:16px 25px}.subscribe-icon{width:19px;height:22px;margin-right:12px;margin-top:4px}.subscribe-message{font-family:OpenSans;font-size:18px;font-weight:bold;color:#fff;margin:0}\n.primary-background{background:#FFFFFF;}.primary-color{color:#FFFFFF;}.secondary-color{color:#000000;}.secondary-background{background:#000000;}.footer{background:#993366;}.footer-text-color{color:#FFFFFF;}.section{color:#000000;}.primary-typeface{font-family:\"Playfair Display\", Lato;}.primary-typeface{font-family:\"Playfair Display\", Lato;}.secondary-typeface{font-family:lato;}.background-logo{background:transparent url(https://images.assettype.com/barandbench/2019-12/7a743b15-5d5d-44d7-96c2-13616780ed95/brand_2x.png) no-repeat;}.partial-story-error {text-align:center; background-color:gray; padding-top:15px; z-index:101; position:fixed; width:100%; top:0;}</style>",
    menu: {
      enabled: true,
      items: [
        {
          title: "Home",
          url: "https://barandbench.com"
        },
        {
          title: "News",
          url: "https://www.barandbench.com/news"
        },
        {
          title: "Dealstreet",
          url: "https://www.barandbench.com/dealstreet"
        },
        {
          title: "Corporate & In-House",
          url: "https://www.barandbench.com/interviews/corporate-in-house"
        },
        {
          title: "Litigation",
          url: "https://www.barandbench.com/interviews/litigation-interviews"
        },
        {
          title: "Law & Policy",
          url: "https://www.barandbench.com/interviews/law-policy-interviews"
        },
        {
          title: "Law Schools",
          url: "https://www.barandbench.com/interviews/law-school-interviews"
        },
        {
          title: "Interviews",
          url: "https://www.barandbench.com/interviews"
        },
        {
          title: "Corporate & In-House",
          url: "https://www.barandbench.com/columns/corporate-law"
        },
        {
          title: "Corporate & In-House",
          url: "https://www.barandbench.com/news/corporate"
        },
        {
          title: "Litigation",
          url: "https://www.barandbench.com/news/litigation"
        },
        {
          title: "Law & Policy",
          url: "https://www.barandbench.com/news/law-policy"
        },
        {
          title: "Law Schools",
          url: "https://www.barandbench.com/news/lawschools"
        },
        {
          title: "Law & Policy",
          url: "https://www.barandbench.com/columns/policy-columns"
        },
        {
          title: "Law Schools",
          url: "https://www.barandbench.com/columns/columns-law-schools"
        },
        {
          title: "Litigation",
          url: "https://www.barandbench.com/columns/litigation-columns"
        },
        {
          title: "The Recruiters",
          url: "https://www.barandbench.com/columns/the-recruiters"
        },
        {
          title: " Working Title",
          url: "https://www.barandbench.com/columns/workingtitle"
        },
        {
          title: "Columns",
          url: "https://www.barandbench.com/columns"
        },
        {
          title: "Moot Courts",
          url: "https://www.barandbench.com/apprentice-lawyer/moot-courts"
        },
        {
          title: "Conferences & Paper presentations",
          url: "https://www.barandbench.com/apprentice-lawyer/call-for-papers"
        },
        {
          title: "Recruitment Tracker",
          url:
            "https://www.barandbench.com/apprentice-lawyer/recruitment-tracker"
        },
        {
          title: "Apprentice Lawyer",
          url: "https://www.barandbench.com/apprentice-lawyer"
        },
        {
          title: "Viewpoint",
          url: "https://www.barandbench.com/view-point"
        },
        {
          title: "Legal Jobs",
          url: "https://www.barandbench.com/legal-jobs"
        }
      ]
    }
  }
};

module.exports = { ampConfig };
