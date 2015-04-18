<?php
$filename = __DIR__.preg_replace('#(\?.*)$#', '', $_SERVER['REQUEST_URI']);
if (PHP_SAPI === 'cli-server' && is_file($filename)) {
    return false;
}

require 'vendor/autoload.php';

(new \Web\App())->run();
