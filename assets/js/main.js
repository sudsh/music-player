const $ =document.querySelector.bind(document)
const $$ =document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'SU_PLAYER'

const cd = $('.cd')
const cdUnder = $('.cd-under')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('.progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const repeatBtn = $('.btn-repeat')
const randomBtn = $('.btn-random')
const playlist = $('.playlist')


const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  // config: {},
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
  {
  name: "Một thuở thanh bình",
  singer: "Tùng TeA x Tuyết x VoVanDuc",
  path: "./assets/music/Mot-Thuo-Thanh-Binh-TeA-Tuyet.mp3",
  image: "./assets/img/song1_mot_thuo_thanh_binh.jpg"
  },
  {
  name: "Những ô cửa màu",
  singer: "Tofu x VoVanDuc",
  path: "./assets/music/Nhung-O-Cua-Mau-Tofu.mp3",
  image: "./assets/img/song2_nhung_o_cua_mau.jpg"
  },
  {
  name: "Cho những gì ta yêu",
  singer: "Tùng TeA x Tuyết x VoVanDuc",
  path: "./assets/music/Cho-Nhung-Gi-Ta-Yeu-Tea-Tuyet-VoVanDuc.mp3",
  image: "./assets/img/song3_cho_nhung_gi_ta_yeu.jpg"
  },
  {
  name: "Qua những tiếng ve",
  singer: "Xesi x Tofu x Urabe x VoVanDuc",
  path: "./assets/music/Qua-Nhung-Tieng-Ve-Tofu-Urabe-Xesi.mp3",
  image: "./assets/img/song4_qua_nhung_tieng_ve.jpg"
  },
  {
  name: "Già cùng nhau là được",
  singer: "Tùng TeA x PC x VoVanDuc",
  path: "./assets/music/Gia-Cung-Nhau-La-Duoc-Tea-PC.mp3",
  image: "./assets/img/song5_gia_cung_nhau_la_duoc.jpg"
  },
  {
  name: "Sóng biển",
  singer: "Tùng TeA x Tofu x PC x VoVanDuc",
  path: "./assets/music/Song-Bien-TungTeA-Tofu-PC-VoVanDuc.mp3",
  image: "./assets/img/song6_song_bien.jpg"
  },
  {
  name: "Lãng du",
  singer: "Tofu x An x VoVanDuc",
  path: "./assets/music/Lang-Du-Tofu-An.mp3",
  image: "./assets/img/song7_lang_du.jpg"
  }
  ],
  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function() {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
          <div class="thumb" style="background-image: url('${song.image}')">
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playlist.innerHTML = htmls.join('')
  },
  defineProperties: function() {
    Object.defineProperty(this, 'currentSong', {
      get: function() {
        return this.songs[this.currentIndex]
      }
    })
  },
  handleEvents: function() {
    const _this = this
    const cdWidth = cd.offsetWidth

    //Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)'} //quay 360 do
    ], {
      duration: 10000, //10s
      iterations: Infinity
    })
    cdThumbAnimate.pause()

    //xử lý phóng to / thu nhỏ cd
    document.onscroll = function() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCdWidth = cdWidth - scrollTop

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
      cd.style.opacity = newCdWidth / cdWidth
      cdUnder.style.opacity = newCdWidth / cdWidth
    }

    //xử lý khi click play / pause
    playBtn.onclick = function() {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }

    //khi song được play
    audio.onplay = function() {
      _this.isPlaying = true
      player.classList.add('playing')
      cdUnder.classList.add('active')
      cdThumbAnimate.play()
    }

    //khi song bị pause
    audio.onpause = function() {
      _this.isPlaying = false
      player.classList.remove('playing')
      cdUnder.classList.remove('active')
      cdThumbAnimate.pause()
    }

    //khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function() {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
      }
    }

    //Xử lý khi tua bài hát
    progress.onchange = function(e) {
      const seekTime = audio.duration / 100 * e.target.value
      audio.currentTime = seekTime
    }

    //Khi next bài hát
    nextBtn.onclick = function() {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.nextSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    //Khi prev bài hát
    prevBtn.onclick = function() {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.prevSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    //xử lý khi bật / tắt random bài hát
    randomBtn.onclick = function(e) {
      _this.isRandom = !_this.isRandom
      _this.setConfig("isRandom", _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    //Xử lý lặp lại bài hát khi ấn repeat bài hát
    repeatBtn.onclick = function(e) {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig("isRepeat", _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    //Xử lý next bài hát khi ended
    audio.onended = function() {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }
    }

      //Lắng nghe click trong playlist
    playlist.onclick = function(e) {
      const songNode = e.target.closest('.song:not(.active)')
      if (songNode || e.target.closest('.option')) {
        //xử lý khi bấm vào bài hát
        if (songNode) {
          _this.currentIndex = Number(songNode.getAttribute('data-index'))
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }
        //xử lý khi bấm vào option bài hát
        if (e.target.closest('.option')) {

        }
      }
    }
  },
  scrollToActiveSong: function() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 500)
  },
  loadCurrentSong: function() {
    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
  },
  loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },
  nextSong: function() {
    this.currentIndex ++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },
  prevSong: function() {
    this.currentIndex --
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },
  playRandomSong: function() {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)
    this.currentIndex = newIndex
    this.loadCurrentSong()
  },
  start: function() {
    // gán cấu hình từ config vào object
    this.loadConfig()

    //định nghĩa các thuộc tính cho object
    this.defineProperties()

    //Lắng nghe / xử lý các sự kiện (DOM event)
    this.handleEvents()

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong()

    //Render playlist
    this.render()

    //hiển thị trạng thái ban đầu của btn random và repeat
    randomBtn.classList.toggle('active', _this.isRandom)
    repeatBtn.classList.toggle('active', _this.isRepeat)
  }
}

app.start()