<?php

class Image{
   public function resizeByWidth($filename, $width, $newfilename){
      $image;
      $image_info = getimagesize($filename); 
      $image_type = $image_info[2];
      
      // image creation from file name
        try{
            if ($image_type == IMAGETYPE_JPEG)
               $image = imagecreatefromjpeg($filename);
            elseif ($image_type == IMAGETYPE_GIF)
               $image = imagecreatefromgif($filename);
            elseif ($image_type == IMAGETYPE_PNG)
               $image = imagecreatefrompng($filename);
            else throw new Exception("Wrong image type", 500);
        }
        catch(Exception $e){
            $response = ["error" => array("code"  => $e->getCode(), "description" => $e->getMessage())];
        }
      
        // resizing image by width
        $ratio = $width / imagesx($image);
        $height = imagesy($image) * $ratio;
        $new_image = imagecreatetruecolor($width, $height);
        imagecopyresampled($new_image, $image, 0, 0, 0, 0, $width, $height, imagesx($image), imagesy($image));
        $image = $new_image;

        // saving image to current folder
        if ($image_type == IMAGETYPE_JPEG){
           imagejpeg($image, $newfilename.".jpg", 80);
           imagedestroy($image);
           $response = $newfilename.".jpg";
        }
        elseif ($image_type == IMAGETYPE_GIF){
           imagegif($image, $newfilename.".gif");
           imagedestroy($image);
           $response = $newfilename.".gif";
        }
        elseif ($image_type == IMAGETYPE_PNG){
           imagepng($image, $newfilename.".png");
           imagedestroy($image);
           $response = $newfilename.".png";
        }
        
        return $response;
   }
   
   public function reduceQuality($filename, $newfilename){
      $image;
      $image_info = getimagesize($filename); 
      $image_type = $image_info[2];
      
        try{
            // image creation from file name
            if ($image_type == IMAGETYPE_JPEG)
               $image = imagecreatefromjpeg($filename);
            elseif ($image_type == IMAGETYPE_GIF)
               $image = imagecreatefromgif($filename);
            elseif ($image_type == IMAGETYPE_PNG)
               $image = imagecreatefrompng($filename);
            else throw new Exception("Wrong image type", 500);
        }
        catch(Exception $e){
            $response = ["error" => array("code"  => $e->getCode(), "description" => $e->getMessage())];
        }
      
        // saving image to current folder
        if ($image_type == IMAGETYPE_JPEG){
           imagejpeg($image, $newfilename.".jpg", 80);
           imagedestroy($image);
           $response = $newfilename.".jpg";
        }
        elseif ($image_type == IMAGETYPE_GIF){
           imagegif($image, $newfilename.".gif");
           imagedestroy($image);
           $response = $newfilename.".gif";
        }
        elseif ($image_type == IMAGETYPE_PNG){
           imagepng($image, $newfilename.".png");
           imagedestroy($image);
           $response = $newfilename.".png";
        }
        
        return $response;
   }
}

?>
