<?php
function uOrd($char)
{
    return unpack('N', mb_convert_encoding($char, 'UCS-4BE', 'UTF-8'))[1];
}

$chars     = explode(' ', trim(fgets(STDIN)));
$charsOrig = $chars;
$chars     = array_map(
    function ($char) {
        return '0u'.dechex(uOrd($char));
    },
    $chars
);
$charsOrig = array_map(
    function ($char) {
        return '"'.$char.'"';
    },
    $charsOrig
)
?>#!/usr/bin/env fontforge

Open('../../src/fonts/NotoSansCJKjp-Regular.otf')
# CIDChangeSubFont('NotoSansCJKjp-Regular-Ideographs')
CIDFlatten()
Reencode('unicode')
MergeFonts('../../src/fonts/migu-1m-regular.ttf')
chars     = [<?php echo implode(',', $chars    ); ?>]
charsOrig = [<?php echo implode(',', $charsOrig); ?>]
i         = 0
iz        = SizeOf(chars)
while (i < iz)
    if (InFont(chars[i]))
        Print(charsOrig[i])
        SelectMoreSingletons(chars[i])
    else
        Print("No " + charsOrig[i])
    endif
    ++i
endloop
SelectInvert()
Clear()
SetFondName('UniSeiJi')
Generate('../../assets/uniseiji.ttf')
Close()
