<?php

require('fpdf/fpdf.php');
require('FPDFMC.class.php');

use Database as DB;

class PropertyDoc extends DB\TinyMVCDatabaseObject{
    const tablename  = 'property_doc';
    
    public function setTitle($id, $title){
        $doc = $this->load(intval($id));
        
        try{
            if ($doc->agent != $_SESSION["user"]){
                throw new Exception("Access forbidden", 505);
            }
            
            $doc->name = strval($title);
            $response = $doc->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function createComparisonPdf($agreement_id, $agreement_name, $items, $property){
        global $stock;
        
        //################### creating pdf #####################//
        $pdf = new PDF_MC_Table();
        $agreement_name = intval($agreement_name);
        $agreement_id = intval($agreement_id);
        $items = json_decode($items, true);
        $doc_name = intval($property)."_".$_SESSION["user"].".pdf";
        
        $pdf->AddPage();
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(180, 10, 'Client list for property N '.intval($property), 0, 1, 'C');
        $pdf->SetWidths(array(30,160));
        $pdf->Row(array("Client", "Description"));
        $pdf->SetFont('Arial','',14);
        
        for ($i = 0; $i < count($items); $i++){
            $pdf->Row(array($items[$i]["id"], $items[$i]["data"]));
        }
        
        $pdf_response = $pdf->Output('F', dirname(dirname(__FILE__))."/storage/".$doc_name);
        
        //##################### saving to storage #######################//
        
        $parameters = [
            "location" => $doc_name, 
            "name" => $doc_name, 
            "agreement" => $agreement_id, 
            "property" => intval($property), 
            "agent" => $_SESSION["user"]
        ];
        
        if ($stock->exist(intval($property))){
            $parameters["stock"] = 1;
            $parameters["stock_changed"] = $stock->getIDOnly(intval($property));
        }
        
        $newdoc = $this->create($parameters);
        $newdoc->save();
        
        return $pdf_response;
    }
    
    public function prepareComparisonPdfForPrint($items, $property){
        //################### creating pdf #####################//
        //$pdf = new FPDF();
        $pdf = new PDF_MC_Table();
        $items = json_decode($items, true);
        $doc_name = uniqid().".pdf";
        
        $pdf->AddPage();
        $pdf->SetFont('Arial','B',12);
        $pdf->Cell(180,10,'Client list for property N '.$property,0,1,'C');
        //$pdf->SetFont('Arial','B',11);
        //$pdf->Cell(30,10,'Client',1,0,'C');
        //$pdf->Cell(50,10,'Property N',1,0,'C');
        //$pdf->Cell(150,10,'Description',1,1,'C'); 
        //$pdf->SetFont('Arial','',11);
        
        
        //$pdf->AddPage();
        
        //Table with 20 rows and 4 columns
        $pdf->SetWidths(array(30,160));
        $pdf->Row(array("Client", "Description"));
        $pdf->SetFont('Arial','',14);
        //srand(microtime()*1000000);
        for ($i = 0; $i < count($items); $i++)
            $pdf->Row(array($items[$i]["id"], $items[$i]["data"]));
        
        $pdf_response = $pdf->Output('F', dirname(dirname(__FILE__))."/storage/".$doc_name);
        
        return $doc_name;
    }
}

class ClientDoc extends DB\TinyMVCDatabaseObject{
    const tablename  = 'client_doc';
    
    public function setTitle($id, $title){
        $id = intval($id);
        $title = strval($title);
        $doc = $this->load($id);
        
        try{
            if ($doc->agent != $_SESSION["user"])
                throw new Exception("Access forbidden", 505);
            
            $doc->name = $title;
            $response = $doc->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }

    public function createComparisonPdf($agreement_id, $agreement_name, $items, $client){
        //################### creating pdf #####################//
        $pdf = new PDF_MC_Table();
        $agreement_name = intval($agreement_name);
        $agreement_id = intval($agreement_id);
        $items = json_decode($items, true);
        $doc_name = $agreement_name."_".$_SESSION["user"].".pdf";
        
        $pdf->AddPage();
        $pdf->SetFont('Arial','B',12);
        $pdf->Cell(180,10,'Property list for client N '.$client,0,1,'C');
        //$pdf->SetFont('Arial','B',11);
        //$pdf->Cell(30,10,'Client',1,0,'C');
        //$pdf->Cell(50,10,'Property N',1,0,'C');
        //$pdf->Cell(150,10,'Description',1,1,'C'); 
        //$pdf->SetFont('Arial','',11);
        
        
        //$pdf->AddPage();
        
        //Table with 20 rows and 4 columns
        $pdf->SetWidths(array(30,160));
        $pdf->Row(array("Property", "Description"));
        $pdf->SetFont('Arial','',14);
        //srand(microtime()*1000000);
        for ($i = 0; $i < count($items); $i++)
            $pdf->Row(array($items[$i]["id"], $items[$i]["data"]));
        
        $pdf_response = $pdf->Output('F', dirname(dirname(__FILE__))."/storage/".$doc_name);
        
        //##################### saving to storage #######################//
        
        $client = intval($client);
        $parameters = ["location" => $doc_name, "name" => $doc_name, "agreement" => $agreement_id, "client" => $client, "agent" => $_SESSION["user"]];
        $newdoc = $this->create($parameters);
        $newdoc->save();
        
        return $pdf_response;
    }
    
    public function prepareComparisonPdfForPrint($items, $client){
        //################### creating pdf #####################//
        //$pdf = new FPDF();
        $pdf = new PDF_MC_Table();
        $items = json_decode($items, true);
        $doc_name = uniqid().".pdf";
        
        $pdf->AddPage();
        $pdf->SetFont('Arial','B',12);
        $pdf->Cell(180,10,'Property list for client N '.$client,0,1,'C');
        //$pdf->SetFont('Arial','B',11);
        //$pdf->Cell(30,10,'Client',1,0,'C');
        //$pdf->Cell(50,10,'Property N',1,0,'C');
        //$pdf->Cell(150,10,'Description',1,1,'C'); 
        //$pdf->SetFont('Arial','',11);
        
        
        //$pdf->AddPage();
        
        //Table with 20 rows and 4 columns
        $pdf->SetWidths(array(30,160));
        $pdf->Row(array("Property", "Description"));
        $pdf->SetFont('Arial','',14);
        //srand(microtime()*1000000);
        for ($i = 0; $i < count($items); $i++)
            $pdf->Row(array($items[$i]["id"], $items[$i]["data"]));
        
        $pdf_response = $pdf->Output('F', dirname(dirname(__FILE__))."/storage/".$doc_name);
        
        return $doc_name;
    }
}