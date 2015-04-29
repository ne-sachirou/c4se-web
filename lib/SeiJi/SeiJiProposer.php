<?php
namespace SeiJi;

class SeiJiProposer
{
    private $dic = [];

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
                if (count($line) <= 2) {
                    return $carry;
                }
                $carry[$line[0]] = array_slice($line, 1);
                return $carry;
            },
            []
        );
    }

    public function propose($text)
    {
        $processed = [];
        foreach (explode("\n", $text) as $line) {
            $line = $this->proposeLine($line);
            $processed[] = $line;
        }
        return implode("\n", $processed);;
    }

    public function proposeFile($path)
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
        $text = $this->propose($text);
        rewind($file);
        ftruncate($file, 0);
        fwrite($file, $text);
        flock($file, LOCK_UN);
        fclose($file);
    }

    private function proposeLine($line)
    {
        $processed = '';
        for ($i = 0, $iz = mb_strlen($line, 'UTF-8'); $i < $iz; ++$i) {
            $char = mb_substr($line, $i, 1, 'UTF-8');
            if (isset($this->dic[$char])) {
                echo "$line
0:\t$char (no change)\n";
                foreach ($this->dic[$char] as $n => $choice) {
                    echo ($n + 1).":\t$choice\n";
                }
                echo "?:\t";
                $selection = (int) fgets(STDIN);
                if ($selection && isset($this->dic[$char][$selection])) {
                    $char = $this->dic[$char][$selection - 1];
                }
            }
            $processed .= $char;
        }
        return $processed;
    }
}
