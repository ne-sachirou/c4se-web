<?php
$filename = __DIR__.preg_replace('#(\?.*)$#', '', urldecode($_SERVER['REQUEST_URI']));
if (PHP_SAPI === 'cli-server' && is_file($filename)) {
    return false;
}

require 'vendor/autoload.php';

(new Dotenv\Dotenv(__DIR__))->load();
(new \Web\App())->run();
