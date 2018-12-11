.PHONY: rpm deb

all: rpm deb

rpm:
				docker run --rm -v `pwd`/server:/root/rpmbuild/server \
					-v `pwd`/analytics:/root/rpmbuild/analytics \
					-v `pwd`/.git/HEAD:/root/rpmbuild/.git/HEAD \
					-v `pwd`/.git/refs:/root/rpmbuild/.git/refs \
					-v `pwd`/build/rpm_build:/root/rpmbuild/rpm \
					-v `pwd`/RPMS:/root/rpmbuild/RPMS \
					-e "GIT_HASH=`git rev-parse --short HEAD`" \
					amper43/hastic-rpmbuilder rpmbuild -ba /root/rpmbuild/rpm/hastic-server.spec

deb:
				#
