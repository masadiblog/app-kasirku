  <div class="container">
    <div class="title">
      <h1>KasirKu</h1>
    </div>
    <form id="form-register" autocomplete="off">
      <div class="row">
        <input type="text" id="nama" placeholder="Nama">
        <div class="err"></div>
      </div>
      <div class="row">
        <input type="text" id="username" placeholder="Username">
        <div class="err"></div>
      </div>
      <div class="row">
        <input type="password" id="password" placeholder="Password">
        <span></span>
        <div class="err"></div>
      </div>
      <div class="row">
        <input type="password" id="konfirmasi" placeholder="Konfirmasi">
        <span></span>
        <div class="err"></div>
      </div>
      <div class="row">
        <button type="submit">Buat Akun</button>
      </div>
      <div class="row texcen">
        Sudah punya akun? <a href="<?=$base_url.'?pg=login';?>">Login Disini</a>
      </div>
    </form>
  </div>