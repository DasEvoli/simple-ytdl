<?php
    $DEFAULT_TIMEOUT = 20;
    $output_json = 
    [
        'downloadUrl' => null,
        'downloadId' => null
    ];

    $error_json = 
    [
        'error' => null,
        'errorMessage' => null
    ];

    try
    {
        $requestParameters = getRequestParameters();
        if($requestParameters == null) throw new Exception("Error in handling the request parameters.");
        $randomId = generate_random_id();
        $youtubeId = $requestParameters['q'];
        $exec_command = "yt-dlp https://youtu.be/$youtubeId";
        $exec_command .= " --socket-timeout $DEFAULT_TIMEOUT ";

        if($requestParameters['only_audio'])
        {
            $extension = 'mp3';
            $exec_command .= " --extract-audio ";
            $exec_command .= " --audio-format $extension";
            $exec_command .= " --audio-quality " . $requestParameters['audio_quality'];
            $exec_command .= " -o output/$randomId.$extension";
        }
        else
        {
            $extension = 'mp4';
            $exec_command .= " --format $extension";
            $exec_command .= " -o output/$randomId.$extension";
        }
        $exec_output = null;
        $exec_code = null;
        exec($exec_command, $exec_output, $exec_code);
        if($exec_code != 0) throw new Exception("Execution of downloader threw an error. Return_Code: " . "$exec_code");

        $output_json['downloadUrl'] = "/output/$randomId.$extension";
        $output_json['downloadId'] = $randomId;
        echo json_encode($output_json);

    }
    catch(Exception $e)
    {
        error_log($e->getMessage());
        $error_json['error'] = true;
        $error_json['errorMessage'] = "Caught Error when trying to process the request. If you did everything correct, contact the admin of this site.";
        echo json_encode($error_json);
    }

    function getRequestParameters(){
        $q = null;
        $only_audio = null;
        $audio_quality = null;
        try
        {
            if(isset($_GET['q']))
            {
                $q = $_GET['q'];
                if($q == null || $q == "") throw new Exception();
            }
            if(isset($_GET['onlyAudio']))
            {
                if($_GET['onlyAudio'] == "true") $only_audio = true;
                elseif($_GET['onlyAudio'] == "false") $only_audio = false;
                else $only_audio = true;
            }
            if(isset($_GET['audioQuality'])) $audio_quality = intval($_GET['audioQuality']);
        }
        catch(Exception $e)
        {
            return null;
        }

        return ['q' => $q, 'only_audio' => $only_audio, 'audio_quality' => $audio_quality];

        
    }

    function generate_random_id():string
    {
        $str = "";
        $letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y','z','0','1','2','3','4','5','6','7','8','9'];
        $arr = [];

        for($i = 0; $i < 20; $i++){
            $r_int = random_int(0, count($letters)-1);
            array_push($arr, $letters[$r_int]);
        }

        foreach($arr as $e){
            $str .= $e;
        }
        
        return $str;
    }
?>