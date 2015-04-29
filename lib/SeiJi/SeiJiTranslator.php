<?php
namespace SeiJi;

class SeiJiTranslator
{
    private $dic = [];

    public function __construct()
    {
        $dic = file_get_contents(__DIR__.'新字舊字對照表.txt');
        $dic = preg_replace('/\A---.*\n---\n/m', '', $dic);
        $dic = preg_replace('/^#.*$/'          , '', $dic);
        $dic = preg_replace('/\s+$/'           , '', $dic);
        $this->dic = array_reduce(
            preg_split('/\n+/', $dic),
            function ($carry, $line) {
                $line = preg_split('/\s+/', $dic);
                if (count($line) > 2) {
                    return $carry;
                }
                $carry[$line[0]] = $line[1];
            },
            []
        );
    }

    public function translate($text)
    {
        foreach ($this->dic as $from => $to) {
            $text = str_replace($from, $to, $text);
        }
        return $text;
    }

    public function translateFile($path)
    {
        if (!is_readable($path)) {
            return;
        }
        if (!($file = fopen($path, 'r+'))) {
            throw new Exception();
        }
        if (!flock($file, LOCK_EX)) {
            fclose($file);
            throw new Exception();
        }
        $text = fread($file, filesize($path));
        $text = $this->translate($text);
        rewind($file);
        ftruncate($file, 0);
        fwrite($file, $text);
        flock($file, LOCK_UN);
        fclose($file);
    }
}
