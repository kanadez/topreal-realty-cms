<?php

include(dirname(__FILE__).'/Agency.data.php');

use Database\TinyMVCDatabase as Database;

class Agency{
    private $id;
    
    /*public function getActiveAgents(){
	$query = Database::createQuery()->select('*')->where('status=? OR status=?');
        $list = Agent::getList($query, ['Active', 'New']);

        return $list;
    }
    
    public function getAgentsList(){
	$list = Agent::getList();
	#Следующая линия будет работать если в таблице topreal_agents будет поле agency_id
	#if ( $agent->getAgencyId() != $this->agency_id ) 
	#	throw new Exception("Agent not exists in agency",504);

        return $list;
    }
    
    public function createAgent($agent_name, $agent_phone){
	$agent = Agent::create(["name" => $agent_name, "phone_number" => $agent_phone]);
        $agent->save();
	#Следующая линия будет работать если в таблице topreal_agents будет поле agency_id
	#if ( $agent->getAgencyId() != $this->agency_id ) 
	#	throw new Exception("Agent not exists in agency",504);

        return $agent;
    }
    
    public function setAgentName($agent_id, $agent_name){
	$agent = Agent::load($agent_id);
        $agent->name = $agent_name;
        $agent->save();
	#Следующая линия будет работать если в таблице topreal_agents будет поле agency_id
	#if ( $agent->getAgencyId() != $this->agency_id ) 
	#	throw new Exception("Agent not exists in agency",504);

        return $agent;
    }*/
    
    function __construct(){
        try{
            $agent = User::load(intval($_SESSION["user"]));

            if ($agent === FALSE)
                throw new Exception("User is not exist", 401);

            $this->id = $agent->getAgency();//$agent->getAgency();
        }
        catch (Exception $e){
            $this->id = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
    }
    
    public function getId(){
        return $this->id;
    }
    
    public function get(){
        return AgencyORM::load($this->id);
    }
    
    public function getPhone($id){
        $agency = AgencyORM::load(intval($id));
        
        return $agency->phone;
    }
    
    public function getCountry(){
        $agency = AgencyORM::load($this->id);
        
        return $agency->country;
    }
    
    public function getAgentsList(){ 
        try{
            //$query = Database::createQuery()->select('id,user')->where('agency=?'); 
            $query = Database::createQuery()->select('name,id')->where('agency=? AND deleted = 0 AND temporary = 0'); 
            $response = User::getList($query, [$this->id]);
            
            if (count($response) === 0)
                throw new Exception("There are no agents in agency", 401);
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
    
    public function getAgentsTotal(){ 
        try{
            //$query = Database::createQuery()->select('id,user')->where('agency=?'); 
            $query = Database::createQuery()->select('id')->where('agency=? AND deleted = 0 AND temporary = 0 AND type = 3'); 
            $response = User::getList($query, [$this->id]);
            
            if (count($response) === 0)
                throw new Exception("There are no agents in agency", 401);
            
            $response = count($response);
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
    
    public function getAgentsWorkTime(){ // только по правам
        try{
            $query = Database::createQuery()->select('id, work_time_from, work_time_to')->where('agency=?'); 
            $response = User::getList($query, [$this->id]);
            
            if (count($response) === 0)
                throw new Exception("There are no agents in agency", 401);
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }

    public function getAgent($agent_id){ // только по правам, на будущее ; ПЛЮС нужно отказаться от класса Agent, он не актуален
        $agent_id = intval($agent_id);
	$agent = Agent::load($agent_id);
        
        try{
            if ($agent === FALSE)
                throw new Exception("Agent not exists at all", 401);
            
            if ($agent->getAgency() != $this->id ) 
                throw new Exception("Agent not exists in agency", 401);

            $response = [
                //"pAgency" => $agency_data["agent"],
                "pAgent" => $agent
            ];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function isMyAgent($agent_id){
	$agent = User::load(intval($agent_id));

        if ($agent->agency != $this->id || $agent === FALSE){
            return 0;
        }
        else{
            return 1;
        }
    }
    
    public function getAgentName($agent_id){ // только по правам, на будущее
        $agent_id = intval($agent_id);
	$agent = User::load($agent_id);
        
        try{
            if ($agent === FALSE)
                throw new Exception("Agent not exists at all", 401);
            
            if ($agent->getAgency() != $this->id ) 
                throw new Exception("Agent not exists in agency", 401);

            $response = $agent->name;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getAgentEmail($agent_id){ // только по правам, на будущее
        $agent_id = intval($agent_id);
	$agent = User::load($agent_id);
        
        try{
            if ($agent === FALSE)
                throw new Exception("Agent not exists at all", 401);
            
            if ($agent->getAgency() != $this->id ) 
                throw new Exception("Agent not exists in agency", 401);

            $response = $agent->email;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function setAgentParameter($parameter, $value, $agent){ // только по правам, причем строго, потому что и изменение пароля через это проходит
        global $agency;
        $parameter = strval($parameter);
        $value = strval($value);
        $agent = intval($agent);
        
        try{
            $agent = User::load($agent);
            
            if ($agent === FALSE)
                throw new Exception("User not exist", 401);
            elseif ($agent->agency != $agency->getId())
                throw new Exception("User not exist in agency", 401);
            
            if ($parameter == "name"){
                $query = Database::createQuery()->select('id')->where('author=? AND default_search=1'); 
                $list = Search::getList($query, [$agent->id]);
                $default_search = Search::load($list[0]->id);
                $default_search->title = "Default for ".$value;
                $default_search->save();
            }
            
            $agent->$parameter = $value;
            $agent->temporary = 0;
            $response = $agent->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
    
    public function getProjectsList(){
        try{
            $query = Database::createQuery()->select('id,title')->where('agency=?'); 
            $response = Project::getList($query, [$this->id]);
            
            if (count($response) === 0)
                throw new Exception("There are no projects in agency", 401);
        }
        catch (Exception $e){
            $this->id = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
    
    public function getProject($project_id){
	$project = Project::load(intval($project_id));
        
        try{
            if ($project === FALSE){
                throw new Exception("Project not exists at all", 401);
            }
            
            if ($project->getAgency() != $this->id ){
                throw new Exception("Project not exists in agency", 401);
            }

            $response = $project;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getProjectName($project_id){
        $project_id = intval($project_id);
	$project = Project::load($project_id);
        
        try{
            if ($project === FALSE)
                throw new Exception("Project not exists at all", 401);
            
            if ($project->agency != $this->id ) 
                throw new Exception("Project not exists in agency", 401);

            $response = $project->title;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getProjectId($project_name){
        $project_name = strval($project_name);
        $project = Project::loadByRow("title", $project_name);
        
        try{
            if ($project === FALSE)
                throw new Exception("Project not exists at all", 401);
            
            if ($project->agency != $this->id) 
                throw new Exception("Project not exists in agency", 401);

            $response = $project->id;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getAgencySearches(){
        $query = Database::createQuery()->select('id, title')->where('agency=? AND deleted=0 AND temporary=0'); 
        return Search::getList($query, [$this->getId()]);
    }
    
    public function getAgentsToEdit(){
        try{
            $query = Database::createQuery()->select('id, name')->where('agency = ? AND deleted = 0 AND id <> ?'); 
            $response = User::getList($query, [$this->id, $_SESSION["user"]]);
            
            if (count($response) === 0){
                throw new Exception("There are no agents in agency", 401);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
    
    public function removeAgent($id){
	$agent = User::load(intval($id));
        
        try{
            if ($agent === FALSE){
                throw new Exception("Agent not exists at all", 401);
            }
            
            if ($agent->agency != $this->id){ 
                throw new Exception("Agent not exists in agency", 401);
            }
            
            $agent->deleted = 1;
            $response = $agent->save();
            $this->updateAgentsCount();
            
            //############# перенос всех привязок агента на хозяина агентства:
            //---- перенос всей недвижимости агента:
            $query = Database::createQuery()->select('id')->where('agent_id = ?'); 
            $properties_list = Property::getList($query, [$id]);
            $main_agent = $this->getMainAgent();
            
            for ($i = 0; $i < count($properties_list); $i++){
                $property = Property::load($properties_list[$i]->id);
                $property->agent_id = $main_agent;
                $property->save();
            }
            
            //---- перенос всех клиентов агента:
            $query = Database::createQuery()->select('id')->where('agent_id = ?'); 
            $clients_list = Client::getList($query, [$id]);
            
            for ($i = 0; $i < count($clients_list); $i++){
                $client = Client::load($clients_list[$i]->id);
                $client->agent_id = $main_agent;
                $client->save();
            }
            
            //---- перенос всех событий компарижна клиента агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $client_comparison_events_list = ClientComparison::getList($query, [$id]);
            
            for ($i = 0; $i < count($client_comparison_events_list); $i++){
                $client_comparison_event = ClientComparison::load($client_comparison_events_list[$i]->id);
                $client_comparison_event->author = $main_agent;
                $client_comparison_event->save();
            }
            
            //---- перенос всех списков компарижна клиента агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $client_comparison_lists_list = ClientComparisonList::getList($query, [$id]);
            
            for ($i = 0; $i < count($client_comparison_lists_list); $i++){
                $client_comparison_list = ClientComparisonList::load($client_comparison_lists_list[$i]->id);
                $client_comparison_list->author = $main_agent;
                $client_comparison_list->save();
            }
            
            //---- перенос всех доков на клиентах агента:
            $query = Database::createQuery()->select('id')->where('agent = ?'); 
            $client_docs_list = ClientDoc::getList($query, [$id]);
            
            for ($i = 0; $i < count($client_docs_list); $i++){
                $client_doc = ClientDoc::load($client_docs_list[$i]->id);
                $client_doc->agent = $main_agent;
                $client_doc->save();
            }
            
            //---- перенос всех контуров агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $contours_list = Contour::getList($query, [$id]);
            
            for ($i = 0; $i < count($contours_list); $i++){
                $contour = Contour::load($contours_list[$i]->id);
                $contour->author = $main_agent;
                $contour->save();
            }
            
            //---- перенос всех событий истории агента:
            $query = Database::createQuery()->select('id')->where('user = ?'); 
            $history_list = History::getList($query, [$id]);
            
            for ($i = 0; $i < count($history_list); $i++){
                $history = History::load($history_list[$i]->id);
                $history->user = $main_agent;
                $history->save();
            }
            
            //---- перенос всех событий истории агента:
            $query = Database::createQuery()->select('id')->where('user = ?'); 
            $history_list = History::getList($query, [$id]);
            
            for ($i = 0; $i < count($history_list); $i++){
                $history = History::load($history_list[$i]->id);
                $history->user = $main_agent;
                $history->save();
            }
            
            //---- перенос всех сохраненных списков агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $lists_list = ResponseList::getList($query, [$id]);
            
            for ($i = 0; $i < count($lists_list); $i++){
                $list = ResponseList::load($lists_list[$i]->id);
                $list->author = $main_agent;
                $list->save();
            }
            
            //---- перенос всех событий совы агента:
            $query = Database::createQuery()->select('id')->where('agent = ?'); 
            $owls_list = Owl::getList($query, [$id]);
            
            for ($i = 0; $i < count($owls_list); $i++){
                $owl = Owl::load($owls_list[$i]->id);
                $owl->agent = $main_agent;
                $owl->save();
            }
            
            //---- перенос всех событий совы агента:
            $query = Database::createQuery()->select('id')->where('agent = ?'); 
            $owls_list = Owl::getList($query, [$id]);
            
            for ($i = 0; $i < count($owls_list); $i++){
                $owl = Owl::load($owls_list[$i]->id);
                $owl->agent = $main_agent;
                $owl->save();
            }
            
            //---- перенос всех событий компарижна недвижимости агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $property_comparison_events_list = PropertyComparison::getList($query, [$id]);
            
            for ($i = 0; $i < count($property_comparison_events_list); $i++){
                $event = PropertyComparison::load($property_comparison_events_list[$i]->id);
                $event->author = $main_agent;
                $event->save();
            }
            
            //---- перенос всех списков компарижна недвижимости агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $property_comparison_lists_list = PropertyComparisonList::getList($query, [$id]);
            
            for ($i = 0; $i < count($property_comparison_lists_list); $i++){
                $list = PropertyComparisonList::load($property_comparison_lists_list[$i]->id);
                $list->author = $main_agent;
                $list->save();
            }
            
            //---- перенос всех списков компарижна недвижимости агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $property_comparison_lists_list = PropertyComparisonList::getList($query, [$id]);
            
            for ($i = 0; $i < count($property_comparison_lists_list); $i++){
                $list = PropertyComparisonList::load($property_comparison_lists_list[$i]->id);
                $list->author = $main_agent;
                $list->save();
            }
            
            //---- перенос всех доков на недвижимости агента:
            $query = Database::createQuery()->select('id')->where('agent = ?'); 
            $property_docs_list = PropertyDoc::getList($query, [$id]);
            
            for ($i = 0; $i < count($property_docs_list); $i++){
                $doc = PropertyDoc::load($property_docs_list[$i]->id);
                $doc->agent = $main_agent;
                $doc->save();
            }
            
            //---- перенос всех цитат агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $property_quotes_list = Quotes::getList($query, [$id]);
            
            for ($i = 0; $i < count($property_quotes_list); $i++){
                $quote = Quotes::load($property_quotes_list[$i]->id);
                $quote->author = $main_agent;
                $quote->save();
            }
            
            //---- перенос всех копий стока агента:
            $query = Database::createQuery()->select('id')->where('agent_id = ?'); 
            $stock_list = Stock::getList($query, [$id]);
            
            for ($i = 0; $i < count($stock_list); $i++){
                $stock = Stock::load($stock_list[$i]->id);
                $stock->agent_id = $main_agent;
                $stock->save();
            }
            
            //---- перенос всех синонимов агента:
            $query = Database::createQuery()->select('id')->where('author = ?'); 
            $synonims_list = Synonim::getList($query, [$id]);
            
            for ($i = 0; $i < count($synonims_list); $i++){
                $synonim = Synonim::load($synonims_list[$i]->id);
                $synonim->author = $main_agent;
                $synonim->save();
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getMainAgent(){
        $agency = AgencyORM::load($this->id);
        
        return $agency->main_agent;
    }
    
    public function getAgentsCount(){
        $query = Database::createQuery()->select('id')->where('agency = ? AND deleted = 0 AND id <> ?'); 
        return count(User::getList($query, [$this->id, $_SESSION["user"]]));
    }
    
    public function addAgents($id, $count){
        $agency = AgencyORM::load(intval($id));
        $defaults = Defaults::loadByRow("agency", $agency->id);
        
        for ($i = 0; $i < $count; $i++){
            $new_agent = User::create([ // create agents for agency
                "agency" => $agency->id,
                "status" => 3,
                "type" => 3,
                "name" => "Agent ".$i,
                "address" => $agency->address,
                "temporary" => 1
            ]);
            $new_agent_id = $new_agent->save();

            $new_user_permission = PermissionORM::create([ // create defaults for main agent
                "user" => $new_agent_id,
                "agency" => $agency->id
            ]);
            $new_user_permission->save();

            $new_user_search = Search::create([ // create defaults for main agent
                "author" => $new_agent_id,
                "agency" => $agency->id,
                "country" => $agency->country,
                "city" => $agency->city,
                "country_text" => Geo::getFullAddress($agency->country),
                "city_text" => Geo::getFullAddress($agency->city),
                "lat" => $defaults->lat,
                "lng" => $defaults->lng,
                "type" => 1,
                "title" => "Default for Agent ".$i,
                "temporary" => 0,
                "default_search" => 1,
                "timestamp" => time()
            ]);
            $default_search = $new_user_search->save();

            $new_user_default = Defaults::create([ // create defaults for main agent
                "user" => $new_agent_id,
                "agency" => $agency->id,
                "country" => $agency->country,
                "city" => $agency->city,
                "lat" => $defaults->lat,
                "lng" => $defaults->lng,
                "locale" => "en",
                "search" => $default_search
            ]);
            $new_user_default->save();
        }
        
        $this->updateAgentsCount();

        return 0;
    }

    public function updateAgentsCount(){
        $query = Database::createQuery()->select('id')->where('agency = ? AND deleted = 0 AND id <> ?'); 
        $agents_count = count(User::getList($query, [$this->id, $_SESSION["user"]]));
        $this_agency = AgencyORM::load($this->id);
        $this_agency->users = $agents_count;
        return $this_agency->save();
    }
    
    public function getExternalStatus(){
        $agency_data = AgencyORM::load($this->id);
        $response = 0;
        $ordered = $agency_data->c1 != null || $agency_data->c2 != null || $agency_data->c3 != null;
        
        if ($ordered && $this->id != 69){ // заказан, НЕ гость
            $response = 1;
        }
        elseif (!$ordered && $this->id != 69){ // НЕ заказан, НЕ гость
            $response = 2;
        }
        
        return $response;
    }
}
