  <div class="container">
<?php if($mesage !== ''){ ?>
    <div class="mesalert"><?=$mesage;?></div>
<?php } ?>
    <div class="title">
      <h1>KasirKu</h1>
    </div>
    <form id="form-login" autocomplete="off">
      <div class="row">
        <input type="text" id="username" placeholder="Username" value="<?=$username;?>">
        <div class="err"></div>
      </div>
      <div class="row">
        <input type="password" id="password" placeholder="Password" value="<?=$password;?>">
        <span></span>
        <div class="err"></div>
      </div>
      <div class="row">
        <button type="submit">Login</button>
      </div>
      <div class="row texcen">
        <a href="<?=$base_url.'?pg=confirm';?>">Lupa Password?</a>
      </div>
    </form>
    <div class="texcen">
      Belum punya akun? <a href="<?=$base_url.'?pg=register';?>">Buat Akun Baru</a>
    </div>
  </div>