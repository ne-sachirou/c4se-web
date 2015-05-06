<?php
namespace SeiJi;

class SeiJiProposer extends SeiJiProcessor
{
    public function __construct()
    {
        parent::__construct();
        $this->dic = array_filter(
            $this->dic,
            function ($item) {
                return count($item) > 1;
            }
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
        $this->processFile($path, [$this, 'propose']);
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
