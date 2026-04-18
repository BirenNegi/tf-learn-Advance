// data/course.js
const phases = [
  { id: 1, name: "Foundations", description: "IaC basics, Terraform setup, Azure authentication" },
  { id: 2, name: "Core Azure Resources", description: "Resource groups, virtual networks, subnets, NSGs" },
  { id: 3, name: "Compute & Storage", description: "VMs, disks, blob storage" },
  { id: 4, name: "State Management", description: "Local vs remote state, locking" },
  { id: 5, name: "Modules & Reusability", description: "Creating and using modules" },
  { id: 6, name: "Advanced Patterns", description: "Loops, conditionals, functions" },
  { id: 7, name: "Production & CI/CD", description: "Terraform Cloud, pipelines, best practices" }
];

const days = [
  // Phase 1: Foundations (Days 1–5)
  {
    id: 1,
    phase: 1,
    title: "What is Infrastructure as Code?",
    theory: `<p>Infrastructure as Code (IaC) means managing your infrastructure (servers, networks, databases) using configuration files instead of manual processes or interactive tools.</p>
<h4>Benefits of IaC:</h4>
<ul><li><strong>Repeatability</strong> – same config = same infrastructure every time.</li>
<li><strong>Version control</strong> – track changes, roll back, collaborate.</li>
<li><strong>Idempotency</strong> – applying the same config multiple times results in the same state.</li>
<li><strong>Automation</strong> – integrate with CI/CD pipelines.</li></ul>
<h4>Terraform vs others:</h4>
<ul><li>Cloud‑agnostic (AWS, Azure, GCP, etc.)</li>
<li>Declarative language (HCL)</li>
<li>State tracking to detect drift</li></ul>
<pre><code># Example Terraform block for Azure
resource "azurerm_resource_group" "example" {
  name     = "my-first-rg"
  location = "East US"
}</code></pre>`,
    lab: `<p><strong>Goal:</strong> Write your first Terraform configuration.</p>
<ol><li>Create a file <code>main.tf</code> with the resource group block above.</li>
<li>Run <code>terraform init</code> (downloads Azure provider).</li>
<li>Run <code>terraform plan</code> to see what will be created.</li>
<li>Run <code>terraform apply</code> (type <code>yes</code>).</li>
<li>Verify the resource group appears in Azure portal (or via <code>az group list</code>).</li></ol>`,
    challenge: `<p>Modify the configuration to create <strong>two</strong> resource groups: <code>rg-dev</code> and <code>rg-prod</code> in the <code>West Europe</code> location. Apply and verify.</p>`,
    resources: ["https://developer.hashicorp.com/terraform/intro"]
  },
  {
    id: 2,
    phase: 1,
    title: "Installing Terraform & Azure CLI",
    theory: `<p>Before writing Terraform code, you need the tools.</p>
<ul><li><strong>Terraform</strong> – download from HashiCorp (binary).</li>
<li><strong>Azure CLI</strong> – cross‑platform tool to manage Azure resources.</li>
<li><strong>Authentication</strong> – Terraform uses Azure CLI credentials automatically if you're logged in.</li></ul>
<p>On Ubuntu/Debian:</p>
<pre><code># Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login</code></pre>`,
    lab: `<p>On your VM (or local machine), install both tools and authenticate:</p>
<ol><li>Run <code>terraform -version</code> – should show v1.5.7 or higher.</li>
<li>Run <code>az --version</code> – should show Azure CLI version.</li>
<li>Run <code>az login</code> – a browser will open; sign in with your Azure account.</li>
<li>Test that Terraform can use your Azure credentials: create a <code>main.tf</code> with any resource and run <code>terraform plan</code> (it should succeed without extra auth).</li></ol>`,
    challenge: `<p>Write a shell script that checks if Terraform and Azure CLI are installed, and if not, prints instructions to install them. Run it on your VM.</p>`,
    resources: ["https://learn.hashicorp.com/tutorials/terraform/install-cli"]
  },
  {
    id: 3,
    phase: 1,
    title: "Terraform Providers and Resources",
    theory: `<p>A <strong>provider</strong> is a plugin that Terraform uses to interact with an API (Azure, AWS, etc.). You declare providers in your configuration.</p>
<pre><code>terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}
provider "azurerm" {
  features {}
}</code></pre>
<p>A <strong>resource</strong> is a component of your infrastructure: a VM, a network, a database. Example:</p>
<pre><code>resource "azurerm_resource_group" "rg" {
  name     = "example-rg"
  location = "East US"
}</code></pre>
<p>Resources have arguments (like <code>name</code>, <code>location</code>) and may output attributes (e.g., <code>azurerm_resource_group.rg.id</code>).</p>`,
    lab: `<p>Write a complete Terraform configuration that includes:</p>
<ul><li>The <code>terraform</code> block with the Azure provider.</li>
<li>One resource group named <code>hands-on-rg</code> in <code>West US</code>.</li>
<li>One virtual network inside that resource group (use any address space).</li></ul>
<p>Run <code>terraform init</code>, <code>plan</code>, and <code>apply</code>. Verify in Azure portal.</p>`,
    challenge: `<p>Add a second resource: a subnet inside the virtual network. Use the resource <code>azurerm_subnet</code> with <code>address_prefixes = ["10.0.1.0/24"]</code>. Reference the VNet's ID using <code>azurerm_virtual_network.vnet.id</code>. Apply and confirm.</p>`,
    resources: []
  },
  {
    id: 4,
    phase: 1,
    title: "Terraform Variables",
    theory: `<p>Hard‑coding values is not scalable. Use <strong>variables</strong> to make configurations reusable.</p>
<pre><code>variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "my-rg"
}
variable "location" {
  type    = string
  default = "East US"
}</code></pre>
<p>Use them in resources:</p>
<pre><code>resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}</code></pre>
<p>Set variable values via:</p>
<ul><li><code>terraform.tfvars</code> file</li>
<li>Environment variables (<code>TF_VAR_resource_group_name</code>)</li>
<li>Command line (<code>-var</code>)</li></ul>`,
    lab: `<p>Create a new directory. Write <code>variables.tf</code> with <code>rg_name</code> and <code>location</code> variables (no defaults). Write <code>main.tf</code> that creates a resource group using those variables. Then create a <code>terraform.tfvars</code> file with actual values. Run <code>terraform plan</code> and <code>apply</code>.</p>`,
    challenge: `<p>Create a variable of type <code>list(string)</code> named <code>environments</code> with values <code>["dev","staging","prod"]</code>. Use the <code>count</code> meta‑argument to create three resource groups, each named <code>"rg-${var.environments[count.index]}"</code>. Apply and verify.</p>`,
    resources: []
  },
  {
    id: 5,
    phase: 1,
    title: "Output Values",
    theory: `<p><strong>Outputs</strong> allow you to query and display important information after <code>terraform apply</code>.</p>
<pre><code>output "resource_group_id" {
  value = azurerm_resource_group.rg.id
}
output "vnet_address_space" {
  value = azurerm_virtual_network.vnet.address_space
}</code></pre>
<p>After apply, run <code>terraform output</code> to see them. You can also format as JSON (<code>-json</code>) for scripting.</p>`,
    lab: `<p>Extend your previous configuration (with three resource groups) to output:</p>
<ul><li>A map of environment -> resource group ID.</li>
<li>The location used.</li>
<li>The current timestamp (using <code>timestamp()</code> function).</li></ul>
<p>Run <code>terraform apply</code> and then <code>terraform output</code> to see the results.</p>`,
    challenge: `<p>Write an output that uses <code>join()</code> to display a comma‑separated list of all resource group names.</p>`,
    resources: []
  },
  // Phase 2: Core Azure Resources (Days 6–10)
  {
    id: 6,
    phase: 2,
    title: "Azure Virtual Networks & Subnets",
    theory: `<p>Azure Virtual Network (VNet) is the fundamental building block for private networks in Azure. Subnets divide the VNet's address space.</p>
<pre><code>resource "azurerm_virtual_network" "vnet" {
  name                = "my-vnet"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]
}
resource "azurerm_subnet" "subnet" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}</code></pre>`,
    lab: `<p>Create a VNet with address space <code>172.16.0.0/16</code>. Inside it, create two subnets: <code>frontend</code> (172.16.1.0/24) and <code>backend</code> (172.16.2.0/24). Use variables for names and locations. Apply and verify in portal.</p>`,
    challenge: `<p>Add a network security group (NSG) and associate it with the frontend subnet. The NSG should allow inbound HTTP (port 80) from anywhere and deny everything else. Use <code>azurerm_network_security_group</code> and <code>azurerm_subnet_network_security_group_association</code>.</p>`,
    resources: []
  },
  {
    id: 7,
    phase: 2,
    title: "Azure Network Security Groups (NSGs)",
    theory: `<p>NSGs filter network traffic to and from Azure resources. They contain security rules that allow or deny traffic based on source/destination IP, port, and protocol.</p>
<pre><code>resource "azurerm_network_security_group" "nsg" {
  name                = "my-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  security_rule {
    name                       = "AllowSSH"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefixes    = ["Your.IP.Address/32"]
    destination_address_prefix = "*"
  }
}</code></pre>`,
    lab: `<p>Create an NSG with three rules:</p>
<ol><li>Allow SSH (port 22) from your home IP only.</li>
<li>Allow HTTP (port 80) from the Internet.</li>
<li>Deny all other inbound traffic (implicitly there is a DenyAll rule).</li></ol>
<p>Associate the NSG with a test subnet. Then try to SSH into a VM (if you create one) to confirm.</p>`,
    challenge: `<p>Write a Terraform configuration that creates an NSG with a rule allowing HTTPS (port 443) from a list of allowed IPs (use a variable <code>allowed_ips</code> of type <code>list(string)</code>). Use <code>dynamic</code> block to generate multiple rules if needed.</p>`,
    resources: []
  },
  {
    id: 8,
    phase: 2,
    title: "Azure Public IP and Network Interface",
    theory: `<p>To give a VM internet access, you need a <strong>public IP</strong> and a <strong>network interface (NIC)</strong> that attaches to a subnet.</p>
<pre><code>resource "azurerm_public_ip" "pip" {
  name                = "my-public-ip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}
resource "azurerm_network_interface" "nic" {
  name                = "my-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip.id
  }
}</code></pre>`,
    lab: `<p>Create a VNet, subnet, public IP, and NIC. Then output the public IP address. Apply and check in portal that the NIC has the public IP associated.</p>`,
    challenge: `<p>Modify the configuration to assign a private IP <strong>statically</strong> (e.g., <code>10.0.1.10</code>) instead of dynamic. Also add a second NIC (without public IP) for backend traffic.</p>`,
    resources: []
  },
  {
    id: 9,
    phase: 2,
    title: "Azure Linux Virtual Machine",
    theory: `<p>Terraform can provision virtual machines. The <code>azurerm_linux_virtual_machine</code> resource requires:</p>
<ul><li>Resource group, location, name</li>
<li>Size (e.g., <code>Standard_B1s</code>)</li>
<li>Admin username and SSH key</li>
<li>Network interface ID</li>
<li>OS disk image (publisher, offer, sku)</li></ul>
<pre><code>resource "azurerm_linux_virtual_machine" "vm" {
  name                = "my-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_B1s"
  admin_username      = "azureuser"
  network_interface_ids = [azurerm_network_interface.nic.id]
  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}</code></pre>`,
    lab: `<p>Using the NIC from previous day, create a Linux VM. Use your own SSH public key (create one if not exists). After apply, SSH into the VM using its public IP.</p>`,
    challenge: `<p>Add a <code>custom_data</code> argument to install <code>nginx</code> on boot (use a bash script). Then open HTTP port in NSG and verify that <code>http://&lt;public-ip&gt;</code> shows the default nginx page.</p>`,
    resources: []
  },
  {
    id: 10,
    phase: 2,
    title: "Azure Storage Account & Blob Container",
    theory: `<p>Azure Storage provides blob storage for files. A storage account is a top‑level container, and inside it you create blob containers.</p>
<pre><code>resource "azurerm_storage_account" "sa" {
  name                     = "mystorageacct123"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}
resource "azurerm_storage_container" "container" {
  name                  = "mycontainer"
  storage_account_name  = azurerm_storage_account.sa.name
  container_access_type = "private"
}</code></pre>`,
    lab: `<p>Create a storage account (name must be globally unique) and a blob container. Upload a sample text file using Azure CLI inside the terminal: <code>az storage blob upload --account-name ... --container-name ... --name test.txt --file test.txt</code>.</p>`,
    challenge: `<p>Use Terraform's <code>azurerm_storage_blob</code> resource to upload a file from your local disk. Use the <code>source</code> argument to point to a file.</p>`,
    resources: []
  },
  // Phase 3: State & Data Sources (Days 11–15)
  {
    id: 11,
    phase: 3,
    title: "Terraform State Basics",
    theory: `<p>Terraform keeps a state file (<code>terraform.tfstate</code>) that maps your configuration to real resources. It is critical for:</p>
<ul><li>Tracking resource metadata</li>
<li>Detecting drift</li>
<li>Planning updates (what changed)</li>
<li>Destroying resources</li></ul>
<p>State is stored locally by default, but for teams you need <strong>remote state</strong> (Azure Storage backend).</p>`,
    lab: `<p>Examine the <code>terraform.tfstate</code> file after an apply. See the JSON structure. Run <code>terraform state list</code> and <code>terraform state show &lt;resource&gt;</code>.</p>`,
    challenge: `<p>Manually delete a resource from the Azure portal (e.g., a resource group). Then run <code>terraform plan</code> – it will want to recreate it. Run <code>terraform refresh</code> to update state, then <code>plan</code> again.</p>`,
    resources: []
  },
  {
    id: 12,
    phase: 3,
    title: "Remote State Backend (Azure Storage)",
    theory: `<p>Store state in an Azure Storage Account so that team members can share it and CI/CD pipelines can access it.</p>
<pre><code>terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate12345"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}</code></pre>
<p>Before using it, you must manually create the storage account and container (can be done with a separate Terraform config or script).</p>`,
    lab: `<p>Create a storage account and container for state (using Azure CLI or a separate Terraform config). Then modify your main config to use that backend. Run <code>terraform init -reconfigure</code> and migrate state. Verify that the state file is now in the blob container.</p>`,
    challenge: `<p>Add a second workspace (<code>terraform workspace new dev</code>) and see how state is isolated per workspace with the same backend key pattern.</p>`,
    resources: []
  },
  {
    id: 13,
    phase: 3,
    title: "State Locking with Azure",
    theory: `<p>When using Azure backend, state locking is automatic using blob leases. This prevents concurrent modifications that could corrupt state.</p>
<p>If a process holds a lock, others will wait or error. You can force unlock if needed: <code>terraform force-unlock &lt;lock-id&gt;</code>.</p>`,
    lab: `<p>Simulate a lock: run <code>terraform apply</code> in one terminal, and in another terminal try to run <code>terraform plan</code>. It will wait or fail. Then cancel the first apply and see the lock release.</p>`,
    challenge: `<p>Write a script that checks if state is locked, and if so, emails an alert (simulate with <code>echo</code>).</p>`,
    resources: []
  },
  {
    id: 14,
    phase: 3,
    title: "Data Sources",
    theory: `<p>Data sources allow you to query existing infrastructure outside of Terraform. Useful to reference resources created by other means.</p>
<pre><code>data "azurerm_resource_group" "existing" {
  name = "my-existing-rg"
}
data "azurerm_subnet" "existing_subnet" {
  name                 = "subnet1"
  virtual_network_name = "existing-vnet"
  resource_group_name  = data.azurerm_resource_group.existing.name
}</code></pre>
<p>Then use <code>data.azurerm_subnet.existing_subnet.id</code> in a VM configuration.</p>`,
    lab: `<p>Create a resource group manually via Azure CLI. Then write Terraform code that uses a data source to fetch that resource group and creates a VNet inside it. Apply and verify.</p>`,
    challenge: `<p>Use <code>azurerm_client_config</code> data source to get your current Azure subscription ID and tenant ID. Output them.</p>`,
    resources: []
  },
  {
    id: 15,
    phase: 3,
    title: "Terraform Import",
    theory: `<p><code>terraform import</code> brings existing resources into Terraform state. You write the resource block first, then import.</p>
<pre><code># Write in config:
resource "azurerm_resource_group" "imported" {
  name     = "existing-rg"
  location = "East US"
}
# Then run:
terraform import azurerm_resource_group.imported /subscriptions/.../resourceGroups/existing-rg</code></pre>
<p>After import, you can manage the resource with Terraform.</p>`,
    lab: `<p>Create a resource group manually (or use one that already exists). Write a matching resource block. Import it. Then add a tag to it via Terraform and apply – it will update the existing RG.</p>`,
    challenge: `<p>Import a virtual network that was created outside Terraform. Add a new subnet to it using Terraform without destroying the VNet.</p>`,
    resources: []
  },
  // Phase 4: Modules (Days 16–20)
  {
    id: 16,
    phase: 4,
    title: "Introduction to Modules",
    theory: `<p>Modules are containers for multiple resources that are used together. They promote reusability and abstraction.</p>
<p>A module is just a directory with Terraform files. You call it from your root config:</p>
<pre><code>module "vnet" {
  source = "./modules/vnet"
  name   = "my-vnet"
  location = var.location
}</code></pre>
<p>Inside the module, you define <code>variable</code> blocks for inputs and <code>output</code> blocks for results.</p>`,
    lab: `<p>Create a <code>modules/vnet</code> folder. Move your VNet and subnet resources into it, with variables for <code>name</code>, <code>location</code>, <code>address_space</code>, <code>subnet_prefix</code>. Call the module from root and create two different VNets using the same module.</p>`,
    challenge: `<p>Add an output to the module that returns the VNet ID. Use that output in the root to create a NIC inside one of the subnets.</p>`,
    resources: []
  },
  {
    id: 17,
    phase: 4,
    title: "Module Sources and Versioning",
    theory: `<p>Modules can come from:</p>
<ul><li>Local paths (<code>./modules/xxx</code>)</li>
<li>GitHub (<code>git::https://github.com/...</code>)</li>
<li>Terraform Registry (<code>terraform-aws-modules/vpc/aws</code>)</li></ul>
<p>You can specify a version to pin compatibility.</p>
<pre><code>module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.0.0"
  # ...
}</code></pre>`,
    lab: `<p>Use the <code>azurerm/network/azurerm</code> module from the Terraform Registry to create a VNet with subnets. Read its documentation and configure it. Apply.</p>`,
    challenge: `<p>Write a simple module that creates a storage account and container. Publish it to a private GitHub repo and reference it via <code>git::https://...</code> with a tag.</p>`,
    resources: []
  },
  {
    id: 18,
    phase: 4,
    title: "Module Composition and Outputs",
    theory: `<p>Modules can call other modules (nested modules). Outputs from a module can be used as inputs to another.</p>
<pre><code>module "networking" {
  source   = "./modules/networking"
  vnet_name = var.vnet_name
}
module "compute" {
  source    = "./modules/compute"
  subnet_id = module.networking.subnet_id
}</code></pre>`,
    lab: `<p>Create two modules: one for networking (VNet + subnet), one for a VM. Have the compute module accept <code>subnet_id</code>. In root, call networking module, then pass its subnet output to compute module. Apply.</p>`,
    challenge: `<p>Add a third module for NSG rules that attaches to the subnet. Use the networking module's output to get the subnet ID. Ensure dependencies are correct.</p>`,
    resources: []
  },
  {
    id: 19,
    phase: 4,
    title: "Module Best Practices",
    theory: `<p>Best practices:</p>
<ul><li>Use semantic versioning for modules.</li>
<li>Document inputs/outputs with <code>description</code>.</li>
<li>Keep modules small and focused.</li>
<li>Use <code>terraform validate</code> and <code>terraform fmt</code>.</li>
<li>Include <code>README.md</code> for each module.</li>
<li>Test modules with <code>terraform plan</code> on example configurations.</li></ul>`,
    lab: `<p>Refactor one of your existing modules to follow these practices. Add descriptions to all variables and outputs. Run <code>terraform fmt -recursive</code> to format everything.</p>`,
    challenge: `<p>Write a simple test using <code>terratest</code> (Go library) to validate that your module creates the expected number of resources.</p>`,
    resources: []
  },
  {
    id: 20,
    phase: 4,
    title: "Module Exercises: Reusable Infrastructure",
    theory: `<p>In real life, you'll create modules for common patterns: a web server cluster, a database, a monitoring setup.</p>`,
    lab: `<p>Create a module called <code>web_server</code> that takes inputs: <code>vm_size</code>, <code>subnet_id</code>, <code>admin_username</code>, <code>public_key_path</code>. It outputs the public IP. Use this module to deploy two web servers in separate subnets.</p>`,
    challenge: `<p>Add a variable <code>instance_count</code> to the module and use <code>count</code> to create multiple VMs. Ensure each gets its own NIC and public IP (or use a load balancer – advanced).</p>`,
    resources: []
  },
  // Phase 5: Advanced Patterns (Days 21–25)
  {
    id: 21,
    phase: 5,
    title: "Loops: count and for_each",
    theory: `<p><code>count</code> creates multiple instances of a resource based on a number. <code>for_each</code> creates instances based on a map or set of strings – more flexible.</p>
<pre><code># count
resource "azurerm_resource_group" "count_rg" {
  count   = 3
  name    = "rg-${count.index}"
  location = "East US"
}
# for_each
resource "azurerm_resource_group" "each_rg" {
  for_each = toset(["dev", "staging", "prod"])
  name     = "rg-${each.key}"
  location = "East US"
}</code></pre>`,
    lab: `<p>Create a list of subnet names and use <code>for_each</code> to create subnets inside a VNet. Output each subnet's ID.</p>`,
    challenge: `<p>Use <code>for_each</code> with a map that includes CIDR blocks: <code>subnets = { frontend = "10.0.1.0/24", backend = "10.0.2.0/24" }</code>. Create the subnets accordingly.</p>`,
    resources: []
  },
  {
    id: 22,
    phase: 5,
    title: "Conditionals: count and ternary",
    theory: `<p>Use <code>count</code> with a condition to optionally create a resource:</p>
<pre><code>resource "azurerm_public_ip" "optional" {
  count = var.create_public_ip ? 1 : 0
  name  = "my-pip"
  # ...
}</code></pre>
<p>Ternary operator: <code>condition ? true_val : false_val</code> – used in variable defaults or inline.</p>`,
    lab: `<p>Write a configuration that creates a VM. Add a variable <code>assign_public_ip</code> (bool). If true, create a public IP and attach it; if false, skip it. Use <code>count</code> on the public IP resource and conditionally set the NIC's <code>public_ip_address_id</code> to null.</p>`,
    challenge: `<p>Create a variable <code>environment</code> (string). If environment is "prod", use larger VM size and enable monitoring; if "dev", use smallest size and no monitoring. Use <code>locals</code> to compute values based on conditionals.</p>`,
    resources: []
  },
  {
    id: 23,
    phase: 5,
    title: "Built-in Functions",
    theory: `<p>Terraform has many functions: <code>format</code>, <code>join</code>, <code>split</code>, <code>lookup</code>, <code>cidrsubnet</code>, <code>file</code>, <code>templatefile</code>, etc.</p>
<pre><code>locals {
  vm_names = formatlist("vm-%02d", range(1, 5))
  tags = {
    Environment = var.env
    Owner       = "team"
  }
  merged_tags = merge(local.tags, { DeployedBy = "Terraform" })
}</code></pre>`,
    lab: `<p>Use <code>cidrsubnet</code> to automatically calculate subnet CIDRs from a VNet address space. Use <code>templatefile</code> to render a user‑data script that passes variables to a VM.</p>`,
    challenge: `<p>Write a local value that takes a map of subnet names to CIDRs, and then generates a list of subnet objects that can be used with <code>for_each</code>.</p>`,
    resources: []
  },
  {
    id: 24,
    phase: 5,
    title: "Dynamic Blocks",
    theory: `<p>Dynamic blocks allow you to generate nested configuration blocks based on a list or map.</p>
<pre><code>dynamic "security_rule" {
  for_each = var.additional_rules
  content {
    name                       = security_rule.value.name
    priority                   = security_rule.value.priority
    direction                  = security_rule.value.direction
    access                     = security_rule.value.access
    protocol                   = security_rule.value.protocol
    source_port_range          = security_rule.value.source_port
    destination_port_range     = security_rule.value.dest_port
    source_address_prefixes    = security_rule.value.source_ips
    destination_address_prefix = "*"
  }
}</code></pre>`,
    lab: `<p>Create an NSG and use a dynamic block to add security rules from a variable <code>rules</code> (list of objects). Apply and verify the NSG has the rules.</p>`,
    challenge: `<p>Use dynamic blocks inside a module to create multiple subnets, each with its own NSG association. Use <code>for_each</code> on the module call.</p>`,
    resources: []
  },
  {
    id: 25,
    phase: 5,
    title: "Terraform Workspaces",
    theory: `<p>Workspaces allow you to manage multiple distinct states from the same configuration. Useful for dev/staging/prod environments.</p>
<pre><code>terraform workspace new dev
terraform workspace new prod
# Use ${terraform.workspace} in resource names
resource "azurerm_resource_group" "rg" {
  name = "rg-${terraform.workspace}"
  location = var.location
}</code></pre>`,
    lab: `<p>Create three workspaces: <code>dev</code>, <code>staging</code>, <code>prod</code>. In each, apply the same configuration that creates a resource group with the workspace name. Verify that resources are separate.</p>`,
    challenge: `<p>Write a backend configuration that uses <code>key = "${terraform.workspace}.tfstate"</code> so each workspace has its own state file.</p>`,
    resources: []
  },
  // Phase 6: Production & CI/CD (Days 26–30)
  {
    id: 26,
    phase: 6,
    title: "Terraform Cloud / Terraform Enterprise",
    theory: `<p>Terraform Cloud provides remote state, private module registry, and team collaboration. It also offers a UI for runs and policy as code (Sentinel).</p>
<p>Basic workflow: connect a VCS (GitHub), define workspaces, and Terraform Cloud runs <code>plan</code> and <code>apply</code> automatically.</p>`,
    lab: `<p>Sign up for Terraform Cloud (free tier). Create a workspace linked to your GitHub repository. Configure the workspace to use the Azure backend (or use Terraform Cloud's own remote state). Run a plan from the UI.</p>`,
    challenge: `<p>Set up a Sentinel policy that forbids creating public IPs in production workspaces. Test it.</p>`,
    resources: []
  },
  {
    id: 27,
    phase: 6,
    title: "CI/CD with GitHub Actions (Azure Login)",
    theory: `<p>You can run Terraform in GitHub Actions using the <code>azure/login</code> action and <code>hashicorp/setup-terraform</code>. The workflow can run <code>terraform plan</code> on pull requests and <code>terraform apply</code> on merge to main.</p>`,
    lab: `<p>Write a GitHub Actions workflow that:</p>
<ul><li>Logs into Azure using a service principal (secrets).</li>
<li>Runs <code>terraform init</code>, <code>validate</code>, <code>plan</code> on PR.</li>
<li>On push to main, runs <code>apply -auto-approve</code>.</li></ul>
<p>Push to your repo and see it run.</p>`,
    challenge: `<p>Add a step that runs <code>terraform output</code> and posts the result as a comment on the PR (using GitHub API).</p>`,
    resources: []
  },
  {
    id: 28,
    phase: 6,
    title: "Testing Terraform Code (Terratest, tflint)",
    theory: `<p>Testing tools:</p>
<ul><li><code>tflint</code> – linter for best practices</li>
<li><code>tfsec</code> – security scanner</li>
<li><code>checkov</code> – static analysis</li>
<li><code>terratest</code> – integration tests in Go</li></ul>
<p>Example Terratest:</p>
<pre><code>func TestTerraformWebServer(t *testing.T) {
  terraformOptions := &terraform.Options{ TerraformDir: "../examples" }
  defer terraform.Destroy(t, terraformOptions)
  terraform.InitAndApply(t, terraformOptions)
  // verify HTTP response
}</code></pre>`,
    lab: `<p>Install <code>tflint</code> and <code>tfsec</code> on your VM. Run them against your configuration. Fix any warnings.</p>`,
    challenge: `<p>Write a simple Terratest (install Go) that deploys a resource group and checks its existence.</p>`,
    resources: []
  },
  {
    id: 29,
    phase: 6,
    title: "Terraform Best Practices",
    theory: `<p>Best practices summary:</p>
<ul><li>Use remote state with locking.</li>
<li>Pin provider and module versions.</li>
<li>Use workspaces or separate directories for environments.</li>
<li>Name resources consistently (use <code>locals</code>).</li>
<li>Use <code>.tfvars</code> for secrets (never commit).</li>
<li>Run <code>terraform fmt</code> and <code>validate</code> in CI.</li>
<li>Prefer <code>for_each</code> over <code>count</code> when order doesn't matter.</li>
<li>Minimize blast radius – split state into multiple configurations.</li>
<li>Use <code>terraform plan</code> in PRs.</li></ul>`,
    lab: `<p>Review your existing configuration and refactor to follow these practices. Create a <code>locals</code> block for naming conventions. Split into multiple root modules if needed.</p>`,
    challenge: `<p>Write a pre‑commit hook that runs <code>terraform fmt</code> and <code>tflint</code> before allowing a commit.</p>`,
    resources: []
  },
  {
    id: 30,
    phase: 6,
    title: "Final Project: Deploy a Complete Web App",
    theory: `<p>Capstone: combine everything you've learned to deploy a three‑tier application on Azure:</p>
<ul><li>VNet with public and private subnets</li>
<li>NSG rules for web and database</li>
<li>Two web VMs in a public subnet with a load balancer</li>
<li>One database VM in a private subnet</li>
<li>Storage account for state and blobs</li>
<li>All using modules, variables, remote state, and CI/CD</li></ul>`,
    lab: `<p>Implement the above using Terraform. Write the configuration in a structured way. Use <code>terraform plan</code> to verify. After apply, test that you can reach the web servers via the load balancer public IP.</p>`,
    challenge: `<p>Add a second environment (staging) using workspaces or separate configuration. Implement a GitHub Actions pipeline that runs <code>plan</code> on PR and <code>apply</code> on merge to main for both dev and prod (with approval for prod).</p>`,
    resources: []
  }
];

module.exports = { phases, days };