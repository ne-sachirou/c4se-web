<?php
namespace SeiJi;

abstract class SeiJiProcessor
{
    protected $dic = [];

    public function __construct()
    {
        $dic = file_get_contents(__DIR__.'/新字舊字對照表.txt');
        $dic = preg_replace('/\A---.*\n---\n/ms', '', $dic);
        $dic = preg_replace('/#.*$/m'           , '', $dic);
        $dic = preg_replace('/\s+$/m'           , '', $dic);
        $this->dic = array_reduce(
            preg_split('/\n+/', $dic),
            function ($carry, $line) {
                $line = preg_split('/\s+/', $line);
                $carry[$line[0]] = array_slice($line, 1);
                return $carry;
            },
            []
        );
    }

    protected function processFile($path, $processor)
    {
        if (!is_readable($path)) {
            return;
        }
        if (!($file = fopen($path, 'r+'))) {
            throw new Exception("Can't open the file $path.");
        }
        if (!flock($file, LOCK_EX)) {
            fclose($file);
            throw new Exception("Can't get a lock of $path.");
        }
        $text = fread($file, filesize($path));
        $text = $processor($text);
        rewind($file);
        ftruncate($file, 0);
        fwrite($file, $text);
        flock($file, LOCK_UN);
        fclose($file);
    }
}
