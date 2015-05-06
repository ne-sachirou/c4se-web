<?php
namespace SeiJi;

class SeiJiTranslator extends SeiJiProcessor
{
    public function __construct()
    {
        parent::__construct();
        foreach ($this->dic as $name => $item) {
            if (count($item) > 1) {
                unset($this->dic[$name]);
            } else {
                $this->dic[$name] = $item[0];
            }
        }
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
        $this->processFile($path, [$this, 'translate']);
    }
}
