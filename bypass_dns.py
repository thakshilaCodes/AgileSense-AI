import dns.resolver

def get_mongodb_atlas_uri(srv_domain, user, password, dbname=""):
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ['8.8.8.8', '8.8.4.4']  # Force Google DNS
    
    srv_query = f"_mongodb._tcp.{srv_domain}"
    try:
        answers = resolver.resolve(srv_query, 'SRV')
    except Exception as e:
        print(f"Failed to resolve SRV via 8.8.8.8: {e}")
        return None
    
    hosts = []
    for rdata in answers:
        # dnspython adds a trailing dot, so we strip it
        host = str(rdata.target).rstrip('.')
        port = rdata.port
        hosts.append(f"{host}:{port}")
        
    hosts_str = ",".join(hosts)
    
    # Resolving TXT for authSource/replicaSet info is also needed for Atlas
    txt_query = srv_domain
    options = ""
    try:
        txt_answers = resolver.resolve(txt_query, 'TXT')
        for txt in txt_answers:
            val = str(txt).strip('"')
            if val:
                options += val
    except Exception:
        pass

    auth = f"{user}:{password}@" if user and password else ""
    return f"mongodb://{auth}{hosts_str}/{dbname}?ssl=true&{options}"

# User's cluster details
user = "Chanuri"
password = "Chanuri123"
domain = "cluster0.sxhh5pv.mongodb.net"

direct_uri = get_mongodb_atlas_uri(domain, user, password)

if direct_uri:
    print(f"DIRECT URI: {direct_uri}")
    
    # Now let's try to update .env
    env_path = r"services\expertise_service\.env"
    with open(env_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        if line.startswith("MONGODB_URI="):
            lines[i] = f"MONGODB_URI={direct_uri}\n"
            
    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
        
    print("SUCCESSFULLY UPDATED .ENV WITH DIRECT ATLAS CONNECTION!")
else:
    print("FAILED TO GENERATE DIRECT URI")
