require 'fileutils'

puts "Checking if 'Deploys' Directory exists"

if ! File.directory? 'Deploys'
    Dir.mkdir("Deploys")
    puts "Creating 'Deploys' Directory"
end

puts 'Deploying application ' + ARGV[0]

t = Time.now()

dir_root = "Deploys/" + ARGV[0] + t.strftime("%Y%m%d_%H%M")
dir_ex = dir_root + "/Applications"
Dir.mkdir(dir_root)
Dir.mkdir(dir_ex)
FileUtils.cp("game.js", dir_root)
FileUtils.cp_r("Images", dir_root)
FileUtils.cp_r('Applications/' + ARGV[0], dir_ex)

puts dir_root




