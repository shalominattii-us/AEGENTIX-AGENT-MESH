$p=7777
$d="C:\Sovereign\AE-Hub\Repos\sovereign-agent\induction"
New-Item $d -ItemType Directory -Force | Out-Null
function L($m){Write-Host "[Ω] $m" -ForegroundColor Cyan}
L "AEGENTIX v1.0"
function S($i){return @{id=[guid]::NewGuid();o="S";c=$i;t=Get-Date -Format "o";e=Get-Random -Minimum 0 -Maximum 1;r=1.0}}
function M($v,$n){return @{id=[guid]::NewGuid();o="M";p=$v.id;md=$n;c="[$n]: "+$v.c;t=Get-Date -Format "o";e=[math]::Min(1,$v.e+0.1);r=$v.r*0.9}}
function R($a,$b){return @{id=[guid]::NewGuid();o="R";p=@($a.id,$b.id);c=$a.c+" | "+$b.c;t=Get-Date -Format "o";e=[math]::Max($a.e,$b.e);r=($a.r+$b.r)/2}}
function D($v){$e=$v.c -replace "[^a-zA-Z0-9 ]","";$e=$e.Substring(0,[math]::Min(100,$e.Length));return @{id=[guid]::NewGuid();o="D";p=$v.id;c="[E]: "+$e;t=Get-Date -Format "o";e=[math]::Max(0,$v.e-0.2);r=$v.r*1.1}}
function A($v){return @{id=[guid]::NewGuid();o="A";p=$v.id;c=$v.c.ToUpper();t=Get-Date -Format "o";e=$v.e;r=[math]::Min(2,$v.r*1.5)}}
function C($v){return @{id=[guid]::NewGuid();o="C";p=$v.id;c="[C]: "+$v.c;t=Get-Date -Format "o";e=0;r=2.0;perm=1}}
function T($ep,$m){try{$body=@{model=$m;prompt="Say SOVEREIGN";stream=$false}|ConvertTo-Json;$resp=Invoke-WebRequest -Uri $ep -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5 -UseBasicParsing;if($resp.StatusCode-eq 200){$content=($resp.Content|ConvertFrom-Json).response;if($content-match"SOVEREIGN"){return 1}}}catch{}return 0}
$mdls=@()
if(T "http://localhost:11434/api/generate" "llama3.1:8b"){$mdls+=@{n="LLAMA";e="http://localhost:11434/api/generate";m="llama3.1:8b"}}
if(T "http://localhost:11434/api/generate" "mistral:7b"){$mdls+=@{n="MISTRAL";e="http://localhost:11434/api/generate";m="mistral:7b"}}
L "Models: $($mdls.Count)"
function I($pr,$de=3){L "Induce: $pr";$se=S $pr;$cu=$se;$li=@($se);for($i=1;$i-le$de;$i++){L "Cycle $i";$rf=@();foreach($m in $mdls){$r=M $cu $m.n;$rf+=$r;try{$body=@{model=$m.m;prompt=$cu.c;stream=$false}|ConvertTo-Json;$re=Invoke-WebRequest -Uri $m.e -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing;$mc=($re.Content|ConvertFrom-Json).response;$r.c="[$($m.n)]: $mc";$r.r=[math]::Min(2,$r.r+0.3);L "$($m.n) OK"}catch{}}if($rf.Count-gt1){$mg=$rf[0];for($j=1;$j-lt$rf.Count;$j++){$mg=R $mg $rf[$j]};$cu=$mg}elseif($rf.Count-eq 1){$cu=$rf[0]}$cu=D $cu;if($cu.r-gt1.2){$cu=A $cu}$li+=$cu}$ou=C $cu;$li+=$ou;return @{seed=$se;lin=$li;out=$ou;de=$de;md=$mdls.Count}}
$listener=New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$p/")
$listener.Start()
L "Server: $p"
while($listener.IsListening){$ctx=$listener.GetContext();$q=$ctx.Request;$s=$ctx.Response;$pa=$q.Url.LocalPath;if($pa-eq"/i"){if($q.HttpMethod-eq"POST"){$rd=New-Object System.IO.StreamReader($q.InputStream);$b=$rd.ReadToEnd();$rd.Close();try{$data=$b|ConvertFrom-Json;$depth=if($data.d){$data.d}else{3};$r=I $data.p $depth;$o=@{s="OK";t=Get-Date -Format "o";res=$r;n=$env:COMPUTERNAME}|ConvertTo-Json -Depth 10;$buf=[System.Text.Encoding]::UTF8.GetBytes($o);$s.ContentType="application/json";$s.StatusCode=200;$s.OutputStream.Write($buf,0,$buf.Length);$r|ConvertTo-Json -Depth 10|Out-File "$d\$($r.out.id).json" -Force;L "Done: $($r.out.id)"}catch{$e=@{s="ERR";m=$_.Exception.Message}|ConvertTo-Json;$buf=[System.Text.Encoding]::UTF8.GetBytes($e);$s.StatusCode=500;$s.OutputStream.Write($buf,0,$buf.Length)}}else{$s.StatusCode=405}}elseif($pa-eq"/s"){$st=@{n=$env:COMPUTERNAME;t=Get-Date -Format "o";e="AEGENTIX v1.0";m=$mdls.Count;p=$p;s="NOMINAL"}|ConvertTo-Json;$buf=[System.Text.Encoding]::UTF8.GetBytes($st);$s.ContentType="application/json";$s.StatusCode=200;$s.OutputStream.Write($buf,0,$buf.Length)}elseif($pa-eq"/m"){$mo=@{a=$mdls;c=$mdls.Count}|ConvertTo-Json;$buf=[System.Text.Encoding]::UTF8.GetBytes($mo);$s.ContentType="application/json";$s.StatusCode=200;$s.OutputStream.Write($buf,0,$buf.Length)}else{$s.StatusCode=404}$s.Close()}