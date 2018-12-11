.PHONY: rpm deb

all: rpm deb

rpm:
				docker run --rm -v `pwd`/server:/root/rpmbuild/server \
					-v `pwd`/analytics:/root/rpmbuild/analytics \
					-v `pwd`/.git/HEAD:/root/rpmbuild/.git/HEAD \
					-v `pwd`/.git/refs:/root/rpmbuild/.git/refs \
					-v `pwd`/SPECS:/root/rpmbuild/SPECS \
					-e "RPM_RELEASE=`git rev-parse --short HEAD`" \
					amper43/hastic-rpmbuilder rpmbuild -ba /root/rpmbuild/SPECS/hastic-server.spec

deb:
				#
