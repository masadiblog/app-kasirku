  <div class="container">
    <div class="title">
      <h1>KasirKu</h1>
    </div>
    <form id="form-replace" autocomplete="off" data-value="<?=trim(base64_decode($_GET['us']),'=');?>">
      <div class="row">
        <input type="password" id="password" placeholder="Password Baru">
        <span>Lihat</span>
        <div class="err"></div>
      </div>
      <div class="row">
        <input type="password" id="konfirmasi" placeholder="Konfirmasi Password Baru">
        <span>Lihat</span>
        <div class="err"></div>
      </div>
      <div class="row">
        <button type="submit">Simpan</button>
      </div>
      <div class="row texcen">
        <a href="<?=$base_url.'?pg=confirm';?>">Kembali</a> &nbsp; <a href="<?=$base_url.'?pg=login';?>">Batal</a>
      </div>
    </form>
  </div>